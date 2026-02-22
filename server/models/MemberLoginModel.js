const mongoose = require("mongoose");

const memberLoginSchema = new mongoose.Schema(
  {
    seniority_no: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MemberLogin", memberLoginSchema, "memberlogins");