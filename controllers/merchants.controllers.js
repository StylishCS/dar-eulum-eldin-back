const { DueAction } = require("../models/DueAction");
const { Merchant } = require("../models/Merchant");

async function createMerchantController(req, res) {
  try {
    const lastMerchant = await Merchant.find().sort({ _id: -1 }).limit(1);
    let UID = "M1";
    if (lastMerchant.length > 0) {
      const lastCustomId = lastMerchant[0].UID.split("M")[1];
      UID = +lastCustomId + 1;
      UID = "M" + UID;
    }
    const merchant = new Merchant({
      name: req.body.name,
      phone: req.body.phone,
      UID: UID,
    });
    await merchant.save();
    return res.status(201).json(merchant);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getMerchantsController(req, res) {
  try {
    const merchants = await Merchant.find();
    return res.status(200).json(merchants);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getMerchantByIdController(req, res) {
  try {
    const merchant = await Merchant.find({ UID: req.params.id });
    return res.status(200).json(merchant[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function updateMerchantDueController(req, res) {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ message: "Merchant Not Found" });
    }

    const amountToDeduct = parseFloat(req.body.amount);
    if (isNaN(amountToDeduct) || amountToDeduct <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    merchant.due = Math.max(0, merchant.due - amountToDeduct);
    await merchant.save();
    const action = new DueAction({
      actionType: "Merchant",
      clientName: merchant.name,
      clientId: merchant._id,
      clientUID: merchant.UID,
      amount: amountToDeduct,
      due: merchant.due,
    });
    await action.save();
    return res.status(200).json(merchant);
  } catch (err) {
    console.error("Error updating merchant due amount:", err);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

// const action = new DueAction({
//   actionType: "Client",
//   clientName: client.name,
//   clientId: client._id,
//   clientUID: client.UID,
//   amount: amountToDeduct,
//   due: client.due,
// });
// await action.save();

module.exports = {
  createMerchantController,
  getMerchantsController,
  getMerchantByIdController,
  updateMerchantDueController,
};
