const mongoose = require("mongoose");
const refundSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    invoiceIssuedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const RefundAction = mongoose.model("RefundAction", refundSchema);
exports.RefundAction = RefundAction;
