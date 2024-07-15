const mongoose = require("mongoose");
const shortFallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Shortfall = mongoose.model("Shortfall", shortFallSchema);
exports.Shortfall = Shortfall;
