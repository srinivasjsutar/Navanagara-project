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
    transactionid: String,
    totalamount: {
      type: Number,
      required: true,
    },
    bookingamount: {
      type: Number,
      required: false, // ← was required: true, now optional
    },
    downpayment: Number,
    installments: Number,
    paymentmode: String,
    bank: String,
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
