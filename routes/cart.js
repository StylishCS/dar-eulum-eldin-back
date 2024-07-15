var express = require("express");
const { checkOutCartController } = require("../controllers/cart.controllers");
var router = express.Router();

router.post("/checkout", checkOutCartController);

module.exports = router;
