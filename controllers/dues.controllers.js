const { DueAction } = require("../models/DueAction");

async function getDuesLogsController(req, res) {
  try {
    const dues = await DueAction.find();
    return res.status(200).json(dues);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getDuesLogsController };
