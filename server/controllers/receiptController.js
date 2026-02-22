const Receipt = require("../models/Receipt");
const SiteBooking = require("../models/SiteBooking");
const Member = require("../models/Member");
const sendMail = require("../utils/mailer");
const cloudinary = require("../cloudinaryConfig");

// Project code mapping — each project has its own independent receipt sequence
const PROJECT_CODES = {
  "New City": "NCG",
  "New City 1": "NCS",
};

// Generate a unique receipt number scoped to a specific project prefix
// e.g. NCG-RCP-000001, NCS-RCP-000001 (independent counters per project)
const generateReceiptNumber = async (projectName) => {
  // Determine prefix from project name, fallback to "RCP" if unknown
  const code = PROJECT_CODES[projectName] || "RCP";
  const prefix = `${code}-RCP-`;

  // Count only receipts belonging to this project's prefix
  const count = await Receipt.countDocuments({
    receipt_no: { $regex: `^${prefix}` },
  });

  let receiptNo;
  let attempts = 0;

  // Loop until we find a truly unused receipt number (handles race conditions)
  do {
    receiptNo = `${prefix}${String(count + 1 + attempts).padStart(6, "0")}`;
    const exists = await Receipt.findOne({ receipt_no: receiptNo });
    if (!exists) break;
    attempts++;
  } while (attempts < 100);

  return receiptNo;
};

exports.updateReceipt = async (req, res) => {
  try {
    const updated = await Receipt.updateOne(
      { _id: req.params.id },
      { $set: req.body },
    );
    if (updated.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Receipt updated successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating receipt",
      error: error.message,
    });
  }
};
// Create receipt
exports.createReceipt = async (req, res) => {
  try {
    const seniorityNumber = req.body.membershipid;
    const userEmail = req.body.email;

    // VALIDATION 1: Check if seniority number is provided
    if (!seniorityNumber) {
      return res.status(400).json({
        success: false,
        message: "Seniority number is required",
      });
    }

    console.log(`🔍 Validating seniority number: ${seniorityNumber}`);

    // VALIDATION 2: Check if member exists with this seniority number
    const memberDoc = await Member.findOne({ seniority_no: seniorityNumber });

    if (!memberDoc) {
      console.log(
        `❌ Member not found for seniority number: ${seniorityNumber}`,
      );
      return res.status(404).json({
        success: false,
        message: `Member not found with seniority number: ${seniorityNumber}. Please ensure the member is registered first.`,
      });
    }

    console.log(`✅ Member found: ${memberDoc.name}`);

    // VALIDATION 3: Check if site booking exists for this seniority number
    const bookingDoc = await SiteBooking.findOne({
      seniority_no: seniorityNumber,
    });

    if (!bookingDoc) {
      console.log(
        `❌ Site booking not found for seniority number: ${seniorityNumber}`,
      );
      return res.status(404).json({
        success: false,
        message: `Site booking not found for seniority number: ${seniorityNumber}. Please create a site booking first.`,
      });
    }

    console.log(`✅ Site booking found for: ${bookingDoc.name}`);

    // All validations passed - proceed with receipt creation
    const bookingamount = parseInt(bookingDoc.bookingamount || 0);
    const bank = req.body.bank || bookingDoc.bank || "";
    const amountpaid = parseInt(req.body.amountpaid || 0);

    // Generate unique receipt number scoped to the project
    // Each project (NCG, NCS) has its own independent sequence
    const projectName = req.body.projectname || bookingDoc.projectname || "";
    let receipt_no = req.body.receiptNo
      ? String(req.body.receiptNo).trim()
      : "";

    if (!receipt_no) {
      // No receipt number provided — auto-generate one for this project
      receipt_no = await generateReceiptNumber(projectName);
    } else {
      // Receipt number provided — check it doesn't already exist
      const existingReceipt = await Receipt.findOne({ receipt_no });
      if (existingReceipt) {
        console.log(
          `⚠️ Receipt number '${receipt_no}' already exists — auto-generating new one for project: ${projectName}`,
        );
        receipt_no = await generateReceiptNumber(projectName);
      }
    }
    console.log(
      `🧾 Using receipt number: ${receipt_no} (Project: ${projectName})`,
    );

    const pdfBase64 = req.body.pdfBase64;

    // Upload PDF to Cloudinary (same pattern as member images)
    let pdfUrl = null;
    if (pdfBase64) {
      try {
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "receipts",
              resource_type: "raw",
              format: "pdf",
              public_id: `Receipt_${receipt_no.replace(/[^a-zA-Z0-9]/g, "_")}`,
              type: "upload", // ✅ ensures public delivery type
              access_mode: "public", // ✅ makes the PDF publicly accessible (no 401)
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          stream.end(pdfBuffer);
        });
        pdfUrl = uploadResult.secure_url;
        console.log(`✅ Receipt PDF uploaded to Cloudinary: ${pdfUrl}`);
      } catch (uploadErr) {
        console.error("⚠️ Cloudinary PDF upload failed:", uploadErr.message);
      }
    }

    const receiptData = {
      membershipid: seniorityNumber,
      receipt_no,
      name: req.body.name || memberDoc.name,
      email: userEmail,
      projectname: req.body.projectname || bookingDoc.projectname,
      date: new Date(req.body.date),
      amountpaid,
      bookingamount,
      mobilenumber: parseInt(req.body.mobilenumber) || memberDoc.mobile,
      totalreceived: bookingamount + amountpaid,
      paymentmode: req.body.paymentmode,
      paymenttype: req.body.paymenttype,
      transactionid: req.body.transactionid,
      sitedimension: req.body.dimension || bookingDoc.sitedimension,
      created_by: req.body.created_by || "Admin",
      bank,
      seniority_no: seniorityNumber,
      pdfUrl, // ✅ Cloudinary URL of the generated receipt PDF
    };

    const receipt = new Receipt(receiptData);
    await receipt.save();

    console.log("📄 Receipt created successfully:", receipt_no);

    // Send response immediately - don't wait for emails
    res.status(201).json({
      success: true,
      message: "Receipt created successfully! Emails are being sent...",
      data: receipt,
    });

    // Send emails in background (after response is sent)
    setImmediate(async () => {
      try {
        const pdfFilename = req.body.pdfFilename || `Receipt_${receipt_no}.pdf`;

        // Customer email message
        const customerMessage = `Dear ${receiptData.name},

Thank you for your payment.

Seniority Number : ${seniorityNumber}
Amount Paid      : Rs.${amountpaid.toLocaleString("en-IN")}
Payment Mode     : ${receiptData.paymentmode}
Transaction ID   : ${receiptData.transactionid}
Date             : ${new Date(receiptData.date).toLocaleDateString("en-IN")}

---

Your payment receipt is attached to this email. For any questions please contact our support team.

Best Regards,
Navanagara House Building Co-operative Society`;

        // Company copy message
        const companyMessage = `New Receipt Generated

Member Name      : ${receiptData.name}
Seniority Number : ${seniorityNumber}
Customer Email   : ${userEmail || "Not provided"}
Mobile           : ${receiptData.mobilenumber || "Not provided"}

---

Amount Paid      : Rs.${amountpaid.toLocaleString("en-IN")}
Booking Amount   : Rs.${bookingamount.toLocaleString("en-IN")}
Total Received   : Rs.${receiptData.totalreceived.toLocaleString("en-IN")}
Payment Mode     : ${receiptData.paymentmode}
Payment Type     : ${receiptData.paymenttype}
Transaction ID   : ${receiptData.transactionid}
Date             : ${new Date(receiptData.date).toLocaleDateString("en-IN")}
Project          : ${receiptData.projectname || "N/A"}

---

PDF receipt is attached.
Navanagara Admin System`;

        const emailPromises = [];

        // 1. Send to CUSTOMER email (from form)
        if (userEmail && userEmail.trim()) {
          console.log(`📧 Sending to customer: ${userEmail}`);
          emailPromises.push(
            sendMail(
              userEmail.trim(),
              `Payment Receipt - ${receipt_no}`,
              customerMessage,
              pdfBase64,
              pdfFilename,
            )
              .then(() =>
                console.log(`✅ Email sent to customer: ${userEmail}`),
              )
              .catch((error) =>
                console.error(
                  `⚠️ Failed to send to customer ${userEmail}:`,
                  error.message,
                ),
              ),
          );
        } else {
          console.log(`⚠️ No customer email provided`);
        }

        // 2. Send to COMPANY email (from .env)
        const companyEmail = process.env.COMPANY_EMAIL; // ✅ fixed from EMAIL_USER
        if (companyEmail && companyEmail.trim()) {
          console.log(`📧 Sending to company: ${companyEmail}`);
          emailPromises.push(
            sendMail(
              companyEmail.trim(),
              `[COMPANY COPY] New Receipt - ${receipt_no}`,
              companyMessage,
              pdfBase64,
              pdfFilename,
            )
              .then(() =>
                console.log(`✅ Email sent to company: ${companyEmail}`),
              )
              .catch((error) =>
                console.error(
                  `⚠️ Failed to send to company ${companyEmail}:`,
                  error.message,
                ),
              ),
          );
        } else {
          console.log(`⚠️ COMPANY_EMAIL not configured in .env`);
        }

        await Promise.all(emailPromises);
        console.log(
          `📧 Email sending completed. Total sent: ${emailPromises.length}`,
        );
      } catch (emailError) {
        console.error("⚠️ Email sending failed:", emailError.message);
      }
    });
  } catch (error) {
    console.error("❌ Error creating receipt:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0] || "field";
      const duplicateValue = error.keyValue
        ? error.keyValue[duplicateField]
        : "";
      return res.status(409).json({
        success: false,
        message: `A receipt with ${duplicateField} '${duplicateValue}' already exists. Please use a different receipt number.`,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating receipt",
      error: error.message,
    });
  }
};

// Get all receipts
exports.getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error("❌ Error fetching receipts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching receipts",
      error: error.message,
    });
  }
};

// Get receipt by ID
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("❌ Error fetching receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching receipt",
      error: error.message,
    });
  }
};

// Download receipt PDF — proxy-streams from Cloudinary to avoid 401 auth errors
exports.downloadReceiptPDF = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).select(
      "pdfUrl receipt_no",
    );

    if (!receipt) {
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }

    if (!receipt.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "PDF not available for this receipt",
      });
    }

    // ✅ Proxy-stream the PDF from Cloudinary through the backend
    // This avoids 401 errors caused by Cloudinary access restrictions
    const https = require("https");
    const http = require("http");

    const filename = `Receipt_${(receipt.receipt_no || "receipt").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    // Set response headers so the browser treats it as a file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Access-Control-Allow-Origin", "*");

    const protocol = receipt.pdfUrl.startsWith("https") ? https : http;
    protocol
      .get(receipt.pdfUrl, (pdfStream) => {
        if (pdfStream.statusCode === 200) {
          pdfStream.pipe(res);
        } else {
          console.error("⚠️ Cloudinary returned status:", pdfStream.statusCode);
          // Fallback: return URL so frontend can try directly
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Content-Disposition", "");
          res.json({ success: true, pdfUrl: receipt.pdfUrl });
        }
      })
      .on("error", (err) => {
        console.error("⚠️ Proxy stream error:", err.message);
        res
          .status(500)
          .json({ success: false, message: "Error streaming PDF" });
      });
  } catch (error) {
    console.error("❌ Error fetching receipt PDF URL:", error);
    res.status(500).json({ success: false, message: "Error fetching PDF" });
  }
};
exports.backfillReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({});
    let updated = 0;

    for (const r of receipts) {
      if (!r.membershipid) continue;
      if (r.bookingamount != null && r.totalreceived != null) continue;

      const bookingDoc = await SiteBooking.findOne({
        seniority_no: r.membershipid,
      });
      const bookingamount = Number(bookingDoc?.bookingamount || 0);
      const amountpaid = Number(r.amountpaid || 0);

      await Receipt.updateOne(
        { _id: r._id },
        {
          $set: {
            bookingamount,
            totalreceived: bookingamount + amountpaid,
          },
        },
      );

      updated++;
    }

    res.status(200).json({
      success: true,
      message: `✅ Updated ${updated} receipt(s).`,
    });
  } catch (error) {
    console.error("❌ Backfill failed:", error);
    res.status(500).json({
      success: false,
      message: "❌ Backfill failed",
      error: error.message,
    });
  }
};
