const { Book } = require("../models/Book");
const Invoice = require("../models/Invoice");
const { Quran } = require("../models/Quran");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const { Client } = require("../models/Client");
const { Merchant } = require("../models/Merchant");

async function checkOutCartController(req, res) {
  try {
    const lastInvoice = await Invoice.find().sort({ _id: -1 }).limit(1);
    let UID = 1;
    if (lastInvoice.length > 0) {
      const lastCustomId = lastInvoice[0].UID;
      UID = lastCustomId + 1;
    }
    const products = req.body.cart;
    let invoice = new Invoice({
      UID: UID,
      totalAmount: req.body.totalAmount,
      discount: req.body.discount,
      profit: req.body.totalAmount - req.body.totalNetPrice - req.body.discount,
      products: products,
      client: req.body.client,
      clientUID: req.body.clientUID,
      paid: req.body.paid,
      due: req.body.due,
    });
    products.map(async (prod) => {
      if (prod.color) {
        await Quran.findByIdAndUpdate(prod._id, {
          $inc: { stock: -prod.quantity, sold: +prod.quantity },
        });
      } else {
        await Book.findByIdAndUpdate(prod._id, {
          $inc: { stock: -prod.quantity, sold: +prod.quantity },
        });
      }
    });
    await invoice.save();
    let clientName;
    if (req.body.client) {
      if (req.body.clientUID.startsWith("C")) {
        const client = await Client.findById(req.body.client);
        clientName = client.name;
        client.invoices.push(invoice);
        client.due += req.body.due;
        await client.save();
      } else {
        const merchant = await Merchant.findById(req.body.client);
        clientName = merchant.name;
        merchant.invoices.push(invoice);
        merchant.due += req.body.due;
        await merchant.save();
      }
    }
    const templatePath = path.join(__dirname, "..", "views", "invoice.ejs");
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
      `invoice_${UID}.pdf`
    );
    await page.pdf({ path: filePath, format: "A4" });

    await browser.close();

    return res
      .status(200)
      .json({ invoice, pdfPath: `http://localhost:3000/invoice_${UID}.pdf` });
  } catch (err) {
    console.log(err);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}
module.exports = { checkOutCartController };
