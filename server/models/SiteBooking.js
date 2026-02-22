const mongoose = require("mongoose");

const siteBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobilenumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    projectname: String,
    sitedimension: String,
    totalamount: {
      type: Number,
      required: true,
    },
    designation: String,
    nominees: [
      {
        name: { type: String },
        age: { type: String },
        relationship: { type: String },
      },
    ],
    seniority_no: {
      type: String,
      required: true,
    },
    status: { type: String, default: "active" },
    cancelled: { type: Boolean, default: false },
    cancellationPdfUrl: { type: String },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "SiteBooking",
  siteBookingSchema,
  "sitebookings",
);
