const mongoose = require("mongoose");
const merchantSchema = new mongoose.Schema(
  {
    UID: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    invoices: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Invoice",
      required: false,
    },
    due: {
      type: Number,
      required: false,
      default: 0,
    },
    blocked: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

const Merchant = mongoose.model("Merchant", merchantSchema);
exports.Merchant = Merchant;
