const { Client } = require("../models/Client");
const { DueAction } = require("../models/DueAction");

async function createClientController(req, res) {
  try {
    const lastClient = await Client.find().sort({ _id: -1 }).limit(1);
    let UID = "C1";
    if (lastClient.length > 0) {
      const lastCustomId = lastClient[0].UID.split("C")[1];
      UID = +lastCustomId + 1;
      UID = "C" + UID;
    }
    const client = new Client({
      UID: UID,
      name: req.body.name,
      phone: req.body.phone,
    });
    await client.save();
    return res.status(201).json(client);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getClientsController(req, res) {
  try {
    const clients = await Client.find();
    return res.status(200).json(clients);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getClientByUIDController(req, res) {
  try {
    const client = await Client.find({ UID: req.params.id });
    return res.status(200).json(client[0]);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function updateDueController(req, res) {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client Not Found" });
    }

    const amountToDeduct = parseFloat(req.body.amount);
    if (isNaN(amountToDeduct) || amountToDeduct <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    client.due = Math.max(0, client.due - amountToDeduct);
    await client.save();
    const action = new DueAction({
      actionType: "Client",
      clientName: client.name,
      clientId: client._id,
      clientUID: client.UID,
      amount: amountToDeduct,
      due: client.due,
    });
    await action.save();
    return res.status(200).json(client);
  } catch (err) {
    console.error("Error updating client due amount:", err);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

module.exports = {
  createClientController,
  getClientsController,
  getClientByUIDController,
  updateDueController,
};
