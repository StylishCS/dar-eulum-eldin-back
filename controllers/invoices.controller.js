const { Client } = require("../models/Client");
const { Merchant } = require("../models/Merchant");
const Invoice = require("../models/Invoice");
const { Book } = require("../models/Book");
const { Quran } = require("../models/Quran");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const { isToday, parseISO } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");
const { RefundAction } = require("../models/RefundAction");
const checkIfNotTodayInEgyptTimezone = (dateString) => {
  const egyptTimeZone = "Africa/Cairo";
  const date = parseISO(dateString);
  const zonedDate = utcToZonedTime(date, egyptTimeZone);
  const now = utcToZonedTime(new Date(), egyptTimeZone);

  const startOfZonedDate = new Date(
    zonedDate.getFullYear(),
    zonedDate.getMonth(),
    zonedDate.getDate()
  );
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return startOfZonedDate.getTime() !== startOfNow.getTime();
};
async function getAllInvoicesController(req, res) {
  try {
    const invoices = await Invoice.find({
      $or: [{ clientUID: null }, { clientUID: /^C/ }],
    });

    return res.status(200).json(invoices.reverse());
  } catch (err) {
    console.log(err);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getMerchantsInvoicesController(req, res) {
  try {
    const invoices = await Invoice.find({ clientUID: /^M/ });

    return res.status(200).json(invoices.reverse());
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getInvoiceByIdController(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    return res.status(200).json(invoice);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function deleteInvoiceController(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);

    await Promise.all(
      invoice.products.map(async (prod) => {
        const cat = prod.color ? "quran" : "book";
        let productToUpdate;

        if (cat === "book") {
          productToUpdate = await Book.findById(prod._id);
        } else {
          productToUpdate = await Quran.findById(prod._id);
        }

        if (productToUpdate) {
          productToUpdate.stock += prod.quantity;
          await productToUpdate.save();
        }
      })
    );

    if (invoice.client) {
      const type = invoice.clientUID.startsWith("C") ? "Client" : "Merchant";
      let user;

      if (type === "Client") {
        user = await Client.findById(invoice.client);
      } else {
        user = await Merchant.findById(invoice.client);
      }

      if (user) {
        user.invoices = user.invoices.filter(
          (item) => item.toString() !== req.params.id
        );
        user.due -= invoice.due;
        await user.save();
      }
    }

    const filePath = path.join(
      __dirname,
      "..",
      "invoices",
      `invoice_${invoice.UID}.pdf`
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const refundAction = new RefundAction({
      amount: invoice.totalAmount,
      invoiceId: invoice._id,
      invoiceIssuedAt: invoice.createdAt,
    });
    await refundAction.save();
    await Invoice.findByIdAndDelete(req.params.id);
    return res.status(200).json("Deleted");
  } catch (err) {
    console.log(err);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function editInvoiceController(req, res) {
  try {
    const groupedActions = req.body.actions.reduce((acc, action) => {
      const { type, index, delta } = action;
      const existingAction = acc.find(
        (item) => item.type === type && item.index === index
      );

      if (existingAction) {
        if (type === "quantity") {
          existingAction.delta += delta;
        }
      } else {
        acc.push({ type, index, delta });
      }

      return acc;
    }, []);

    let invoice = await Invoice.findById(req.params.id);

    for (const action of groupedActions) {
      const { type, index, delta } = action;
      if (type === "quantity") {
        const prodCat = invoice.products[index].color ? "quran" : "book";
        if (prodCat == "quran") {
          const product = await Quran.findById(invoice.products[index]._id);
          if (product.stock - delta < 0) {
            throw new Error(`Not enough stock for product ${product.name}`);
          }
          product.stock -= delta;
          await product.save();
          invoice.products[index].quantity += delta;
        } else {
          const product = await Book.findById(invoice.products[index]._id);
          if (product.stock - delta < 0) {
            throw new Error(`Not enough stock for product ${product.name}`);
          }
          product.stock -= delta;
          await product.save();
          invoice.products[index].quantity += delta;
        }
      } else if (type === "delete") {
        const prodCat = invoice.products[index].color ? "quran" : "book";
        if (prodCat == "quran") {
          const product = await Quran.findById(invoice.products[index]._id);
          product.stock += invoice.products[index].quantity;
          await product.save();
          invoice.products.splice(index, 1);
        } else {
          const product = await Book.findById(invoice.products[index]._id);
          product.stock += invoice.products[index].quantity;
          await product.save();
          invoice.products.splice(index, 1);
        }
      }
    }

    // Calculate the total amount and profit
    let totalAmount = 0;
    let profit = 0;
    invoice.products.forEach((prod) => {
      totalAmount += prod.sellPrice * prod.quantity;
      profit += (prod.sellPrice - prod.netPrice) * prod.quantity;
    });

    if (invoice.totalAmount > totalAmount) {
      const refundAction = new RefundAction({
        amount: invoice.totalAmount - totalAmount,
        invoiceId: invoice._id,
        invoiceIssuedAt: invoice.createdAt,
      });
      await refundAction.save();
    }

    invoice.paid = totalAmount;
    invoice.totalAmount = totalAmount;
    invoice.profit = profit;

    // Save the updated invoice after all actions
    invoice.markModified("products");
    await invoice.save();

    const templatePath = path.join(__dirname, "..", "views", "invoice.ejs");
    let clientName = "";
    if (invoice.client) {
      const client = await Client.findById(invoice.client);
      clientName = client.name;
    }
    const html = await ejs.renderFile(templatePath, { invoice, clientName });
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const filePath = path.join(
      __dirname,
      "..",
      "invoices",
      `invoice_${invoice.UID}.pdf`
    );
    await page.pdf({ path: filePath, format: "A4" });

    await browser.close();
    res.status(200).json("Invoice updated successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  getAllInvoicesController,
  getMerchantsInvoicesController,
  deleteInvoiceController,
  getInvoiceByIdController,
  editInvoiceController,
};
