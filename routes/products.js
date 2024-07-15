var express = require("express");
const {
  GetBooksController,
  GetBookByIdController,
  AddBookController,
  GetQuranController,
  GetQuranByIdController,
  AddQuranController,
  getAllBooksController,
  getAllQuranController,
  updateBookController,
  updateQuranController,
} = require("../controllers/products.controllers");
var router = express.Router();

/* Books Cruds */
router.get("/books", GetBooksController);
router.get("/books/all", getAllBooksController);
router.get("/books/:id", GetBookByIdController);
router.put("/books/:id", updateBookController);
router.post("/books", AddBookController);

/* Quran Cruds */
router.get("/quran", GetQuranController);
router.get("/quran/all", getAllQuranController);
router.get("/quran/:id", GetQuranByIdController);
router.put("/quran/:id", updateQuranController);
router.post("/quran", AddQuranController);

module.exports = router;
