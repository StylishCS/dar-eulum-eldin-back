const mongoose = require("mongoose");
const bookSchema = mongoose.Schema(
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
    manufacture: {
      type: String,
      required: true,
    },
    authors: {
      type: [String],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
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

const Book = mongoose.model("Book", bookSchema);
exports.Book = Book;
