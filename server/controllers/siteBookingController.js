const SiteBooking = require("../models/SiteBooking");
const Member = require("../models/Member");
const Receipt = require("../models/Receipt");
const cloudinary = require("../cloudinaryConfig");

const safeInt = (value) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? undefined : parsed;
};

exports.updateSiteBookingById = async (req, res) => {
  try {
    const {
      seniority_no,
      name,
      projectname,
      sitedimension,
      totalamount,
      date,
      designation,
      nominees,
    } = req.body;

    // ── 1. Fetch the ORIGINAL booking so we know the old seniority_no ────────
    const originalBooking = await SiteBooking.findById(req.params.id);
    if (!originalBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Site booking not found" });
    }
    const oldSeniorityNo = originalBooking.seniority_no;

    // ── 2. Build SiteBooking update fields ───────────────────────────────────
    const updateFields = {};
    if (seniority_no !== undefined) updateFields.seniority_no = seniority_no;
    if (name !== undefined) updateFields.name = name;
    if (projectname !== undefined) updateFields.projectname = projectname;
    if (sitedimension !== undefined) updateFields.sitedimension = sitedimension;
    if (designation !== undefined) updateFields.designation = designation;
    if (nominees !== undefined) updateFields.nominees = nominees;
    if (date !== undefined) updateFields.date = new Date(date);
    if (totalamount !== undefined) {
      const parsed = parseFloat(totalamount);
      if (!isNaN(parsed)) updateFields.totalamount = parsed;
    }

    // ── 3. Update SiteBooking ────────────────────────────────────────────────
    await SiteBooking.updateOne({ _id: req.params.id }, { $set: updateFields });

    // ── 4. Propagate to Member ───────────────────────────────────────────────
    const memberUpdateFields = {};
    if (updateFields.seniority_no !== undefined)
      memberUpdateFields.seniority_no = updateFields.seniority_no;
    if (updateFields.name !== undefined)
      memberUpdateFields.name = updateFields.name;

    if (Object.keys(memberUpdateFields).length > 0) {
      await Member.updateOne(
        { seniority_no: oldSeniorityNo },
        { $set: memberUpdateFields },
      );
    }

    // ── 5. Propagate to Receipt ──────────────────────────────────────────────
    const receiptUpdateFields = {};
    if (updateFields.seniority_no !== undefined)
      receiptUpdateFields.seniority_no = updateFields.seniority_no;
    if (updateFields.name !== undefined)
      receiptUpdateFields.name = updateFields.name;
    if (updateFields.projectname !== undefined)
      receiptUpdateFields.projectname = updateFields.projectname;
    if (updateFields.sitedimension !== undefined)
      receiptUpdateFields.sitedimension = updateFields.sitedimension;

    if (Object.keys(receiptUpdateFields).length > 0) {
      await Receipt.updateMany(
        { seniority_no: oldSeniorityNo },
        { $set: receiptUpdateFields },
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Site booking updated successfully! Changes also applied to Member and Receipt records.",
    });
  } catch (error) {
    console.error("Update site booking error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating site booking",
        error: error.message,
      });
  }
};

exports.createSiteBooking = async (req, res) => {
  try {
    const seniority_no = req.body.seniority_no;
    if (!seniority_no) {
      return res
        .status(400)
        .json({ success: false, message: "seniority_no is required" });
    }

    const memberDoc = await Member.findOne({ seniority_no: seniority_no });
    if (!memberDoc) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Member not found for this seniority number",
        });
    }

    // ✅ Duplicate sitebooking check
    const existingBooking = await SiteBooking.findOne({
      seniority_no: seniority_no,
    });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `Site booking already exists for seniority number ${seniority_no}. Duplicate site booking is not allowed.`,
      });
    }

    const mobilenumber = memberDoc.mobile;

    const siteBooking = new SiteBooking({
      seniority_no: req.body.seniority_no,
      name: req.body.name,
      mobilenumber: mobilenumber,
      date: new Date(req.body.date),
      projectname: req.body.projectname,
      sitedimension: req.body.sitedimension,
      totalamount: parseInt(req.body.totalamount),
      designation: req.body.designation,
      nominees: req.body.nominees || [],
    });

    await siteBooking.save();
    res.status(201).json({ success: true, message: "Created Successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error creating site booking" });
  }
};

exports.getAllSiteBookings = async (req, res) => {
  try {
    const siteBookings = await SiteBooking.find({});
    res.send(siteBookings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching site bookings");
  }
};

exports.updateSiteBooking = async (req, res) => {
  try {
    const fields = {
      seniority_no: req.body.seniority_no,
      name: req.body.name,
      projectname: req.body.projectname,
      date: new Date(req.body.date),
      sitedimension: req.body.sitedimension,
      transactionid: req.body.transactionid,
      totalamount: parseInt(req.body.totalamount),
      bookingamount: safeInt(req.body.bookingamount),
      downpayment: safeInt(req.body.downpayment),
      installments: safeInt(req.body.installments),
      paymentmode: req.body.paymentmode,
    };

    await SiteBooking.updateOne(
      { seniority_no: req.params.id },
      { $set: fields },
    );
    res.send("updated Successfully!..");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating site booking");
  }
};

// Cancel site booking
exports.cancelSiteBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Cancellation PDF is required" });
    }

    // Find the booking first to get seniority_no
    const booking = await SiteBooking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Site booking not found" });
    }

    // Check if already cancelled
    if (booking.cancelled) {
      return res
        .status(400)
        .json({ success: false, message: "Site booking is already cancelled" });
    }

    // Upload PDF to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "cancellations", resource_type: "raw", format: "pdf" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });

    // Mark sitebooking as cancelled — DO NOT DELETE
    await SiteBooking.updateOne(
      { _id: bookingId },
      {
        $set: {
          cancelled: true,
          cancellationPdfUrl: result.secure_url,
          cancelledAt: new Date(),
        },
      },
    );

    // Also mark matching receipt as cancelled
    await Receipt.updateMany(
      { seniority_no: booking.seniority_no },
      {
        $set: {
          cancelled: true,
          cancelledAt: new Date(),
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Site booking cancelled successfully!",
      cancellationPdfUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Cancel site booking error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error cancelling site booking" });
  }
};
