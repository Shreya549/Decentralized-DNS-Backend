const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  email: { type: String },
  password: { type: String },
  accountAddress: { type: String },
  secretKey: { type: String },
});

module.exports = mongoose.model("User", userSchema);
