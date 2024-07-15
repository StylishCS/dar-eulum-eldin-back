const { Book } = require("../models/Book");
const { Quran } = require("../models/Quran");

async function GetBooksController(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;

    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBooks = await Book.countDocuments();

    if (!books.length) {
      return res.status(404).json({ message: "No Books Found" });
    }

    return res.status(200).json({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

async function getAllBooksController(req, res) {
  try {
    const books = await Book.find();
    return res.status(200).json(books);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function AddBookController(req, res) {
  try {
    const book = new Book(req.body);
    book.sold = 0;
    await book.save();
    return res.status(201).json(book);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function GetBookByIdController(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json("Book Not Found");
    }
    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function GetQuranController(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;

    const books = await Quran.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBooks = await Book.countDocuments();

    if (!books.length) {
      return res.status(404).json({ message: "No Books Found" });
    }

    return res.status(200).json({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

async function getAllQuranController(req, res) {
  try {
    const quran = await Quran.find();
    return res.status(200).json(quran);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function AddQuranController(req, res) {
  try {
    const book = new Quran(req.body);
    book.sold = 0;
    await book.save();
    return res.status(201).json(book);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function GetQuranByIdController(req, res) {
  try {
    const book = await Quran.findById(req.params.id);
    if (!book) {
      return res.status(404).json("Book Not Found");
    }
    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function updateBookController(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json("Product Not Found..");
    }
    if (req.body.damaged) {
      req.body.stock -= req.body.damaged;
    }
    await Book.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json("updated");
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function updateQuranController(req, res) {
  try {
    const quran = await Quran.findById(req.params.id);
    if (!quran) {
      return res.status(404).json("Product Not Found..");
    }
    if (req.body.damaged) {
      req.body.stock -= req.body.damaged;
    }
    await Quran.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json("updated");
  } catch (err) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}
module.exports = {
  AddBookController,
  GetBooksController,
  GetBookByIdController,
  AddQuranController,
  GetQuranByIdController,
  GetQuranController,
  getAllBooksController,
  getAllQuranController,
  updateBookController,
  updateQuranController,
};
