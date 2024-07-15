const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    UID: {
      type: Number,
      required: true,
    },
    products: {
      type: [Object],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: false,
    },
    profit: {
      type: Number,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    clientUID: {
      type: String,
      required: false,
    },
    paid: {
      type: Number,
      required: false,
    },
    due: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
