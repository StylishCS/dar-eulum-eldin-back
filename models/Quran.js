const mongoose = require("mongoose");
const quranSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    netPrice: {
      type: Number,
      required: true,
    },
    sellPrice: {
      type: Number,
      required: true,
    },
    merchantsPrice: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    manufacture: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: false,
    },
    stock: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      required: false,
      default: 0,
    },
    damaged: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

const Quran = mongoose.model("Quran", quranSchema);
exports.Quran = Quran;
