const { Shortfall } = require("../models/Shortfall");

async function addShortFallController(req, res) {
  try {
    const exist = await Shortfall.findOne({ name: req.body.name });
    if (exist) {
      return res.status(400).json("Shortfall Already Exist In List");
    }
    const shortfall = new Shortfall({
      name: req.body.name,
      category: req.query.category,
    });
    await shortfall.save();
    return res.status(201).json(shortfall);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getShortFallsController(req, res) {
  try {
    let options = {};
    if (req.query.category != "all") {
      options.category = req.query.category;
    }
    const shortFalls = await Shortfall.find(options);
    return res.status(200).json(shortFalls);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function deleteShortFallController(req, res) {
  try {
    const exist = Shortfall.findOne({ name: req.body.name });
    if (!exist) {
      return res.status(404).json("Shortfall Not Found..");
    }
    await Shortfall.findByIdAndDelete(req.params.id);
    return res.status(200).json("Deleted.");
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  addShortFallController,
  getShortFallsController,
  deleteShortFallController,
};
