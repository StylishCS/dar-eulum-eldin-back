var express = require("express");
const {
  GetAnalyticsController,
} = require("../controllers/analytics.controllers");
const {
  getAllInvoicesController,
  getMerchantsInvoicesController,
  deleteInvoiceController,
  getInvoiceByIdController,
  editInvoiceController,
} = require("../controllers/invoices.controller");
const {
  getClientsController,
  getClientByUIDController,
  createClientController,
  updateDueController,
} = require("../controllers/clients.controller");
const {
  createMerchantController,
  getMerchantsController,
  getMerchantByIdController,
  updateMerchantDueController,
} = require("../controllers/merchants.controllers");
const { getDuesLogsController } = require("../controllers/dues.controllers");
const {
  getShortFallsController,
  addShortFallController,
  deleteShortFallController,
} = require("../controllers/shortFalls.controllers");
var router = express.Router();

/* Analytics */
router.get("/analytics", GetAnalyticsController);

/* Clients */
router.get("/clients", getClientsController);
router.get("/clients/:id", getClientByUIDController);
router.post("/clients", createClientController);
router.patch("/clients/:id", updateDueController);

/* Merchants */
router.get("/merchants", getMerchantsController);
router.get("/merchants/invoices", getMerchantsInvoicesController);
router.get("/merchants/:id", getMerchantByIdController);
router.post("/merchants", createMerchantController);
router.patch("/merchants/:id", updateMerchantDueController);

/* Dues Logs */
router.get("/dues", getDuesLogsController);

/* Short Falls */
router.get("/shortfalls", getShortFallsController);
router.post("/shortfalls", addShortFallController);
router.delete("/shortfalls/:id", deleteShortFallController);

/* Invoices */
router.get("/invoices", getAllInvoicesController);
router.get("/invoices/:id", getInvoiceByIdController);
router.delete("/invoices/:id", deleteInvoiceController);
router.patch("/invoices/:id", editInvoiceController);
module.exports = router;
