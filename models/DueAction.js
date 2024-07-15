const mongoose = require("mongoose");
const dueSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      require: true,
    },
    clientName: {
      type: String,
      require: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    clientUID: {
      type: String,
      require: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    due: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

const DueAction = mongoose.model("DueAction", dueSchema);
exports.DueAction = DueAction;
