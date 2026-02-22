/**
 * generateReceiptPDF
 *
 * Strategy:
 *   1. NEW receipts — calls backend /receipts/:id/download which returns
 *      the Cloudinary URL → downloads the exact PDF that was generated & emailed
 *   2. OLD receipts (no pdfUrl in DB) — re-generates on the fly using the same
 *      ReceiptForm layout via html2canvas + jsPDF
 */

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

// ─── Helpers for fallback re-generation ──────────────────────────────────────

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  if (!num || num === 0) return "Zero";
  const c = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return (
      ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + c(n % 100) : "")
    );
  };
  if (num < 1000) return c(num);
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rem = num % 1000;
  let r = "";
  if (crore) r += c(crore) + " Crore ";
  if (lakh) r += c(lakh) + " Lakh ";
  if (thousand) r += c(thousand) + " Thousand ";
  if (rem) r += c(rem);
  return r.trim();
};

const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

const buildReceiptHTML = (receipt) => {
  const amountpaid = parseFloat(receipt.amountpaid) || 0;
  const bookingamount = parseFloat(receipt.bookingamount) || 0;
  const amountInWords = numberToWords(Math.floor(amountpaid));
  const paymentLabel = receipt.paymenttype || "Amount Paid";
  const isCash = (receipt.paymentmode || "").toLowerCase() === "cash";

  const particulars = [];
  if (bookingamount > 0)
    particulars.push({ name: "Booking Advance", amount: bookingamount });
  if (amountpaid > 0)
    particulars.push({ name: paymentLabel, amount: amountpaid });

  const partRows = particulars
    .map(
      (item, idx) => `
    <tr>
      <td style="border:1px solid #000;padding:8px;width:5%;text-align:center;">${idx + 1}.</td>
      <td style="border:1px solid #000;padding:8px;text-align:left;">${item.name}</td>
      <td style="border:1px solid #000;padding:8px;"></td>
      <td style="border:1px solid #000;padding:8px;text-align:center;">Rs.${Number(item.amount).toLocaleString("en-IN")}</td>
      <td style="border:1px solid #000;padding:8px;"></td>
    </tr>`,
    )
    .join("");

  return `
    <div style="border:2px solid #000;background:#fff;padding:20px;font-family:Arial,sans-serif;width:794px;min-height:1123px;box-sizing:border-box;">
      <div style="display:flex;align-items:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:8px;margin-left:-20px;margin-right:-20px;padding-left:15px;padding-right:15px;gap:12px;">
        <div style="flex-shrink:0;">
          <img src="/images/logo.svg" alt="Logo" style="width:170px;height:170px;object-fit:contain;" crossorigin="anonymous"/>
        </div>
        <div style="flex:1;text-align:center;">
          <div style="font-size:14px;font-weight:bold;margin-bottom:4px;">ನವನಗರ ಹೌಸ್ ಬಿಲ್ಡಿಂಗ್ ಕೋ-ಆಪರೇಟಿವ್ ಸೊಸೈಟಿ ಲಿ.</div>
          <div style="font-size:14px;font-weight:bold;margin-bottom:4px;">NAVANAGARA HOUSE BUILDING CO-OPERATIVE SOCIETY LTD.</div>
          <div style="font-size:11px;margin-bottom:2px;">No.1123, 'A' Block, 20th Cross, Sahakara Nagar, Bangalore - 560092</div>
          <div style="font-size:11px;margin-bottom:2px;">Reg. No: JRB/RGN/CR-04/51588/2024-2025</div>
          <div style="font-size:11px;">www.navanagarahousebuildingsociety.in / Email-navanagarahousingsociety@gmail.com</div>
        </div>
        <div style="width:80px;flex-shrink:0;"></div>
      </div>
      <div style="text-align:center;margin-bottom:8px;">
        <span style="border:2px solid #000;font-weight:bold;font-size:14px;padding:2px 8px;">RECEIPT</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:13px;font-weight:bold;">
        <div>RECEIPT No. ${receipt.receipt_no || "-"}</div>
        <div>Date: ${formatDate(receipt.date)}</div>
      </div>
      <div style="font-size:13px;margin-bottom:16px;">
        <div style="margin-bottom:4px;"><strong>Received From Smt./Shree: ${receipt.name || "-"}</strong></div>
        <div style="margin-bottom:4px;"><strong>Rupees: ${amountInWords} Only.</strong></div>
        <div><strong>Seniority Number: ${receipt.projectname || ""} (${receipt.seniority_no || "-"})</strong></div>
      </div>
      <div style="margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:11px;">
          <thead><tr>
            ${[
              "S.No",
              "Payment Type",
              "Payment Mode",
              "Bank",
              "Branch",
              "Cheque/Transaction ID",
              "Amount",
            ]
              .map(
                (h) =>
                  `<th style="border:1px solid #000;padding:6px;text-align:center;font-weight:bold;font-size:10px;">${h}</th>`,
              )
              .join("")}
          </tr></thead>
          <tbody><tr>
            <td style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;">1</td>
            <td style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;">${paymentLabel}</td>
            <td style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;">${receipt.paymentmode || "-"}</td>
            <td style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;">${isCash ? "" : receipt.bank || "-"}</td>
            <td style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;"></td>
            <td style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;">${isCash ? "" : receipt.transactionid || "-"}</td>
            <td style="border:1px solid #000;padding:6px;text-align:right;font-size:10px;">Rs.${amountpaid.toLocaleString("en-IN")}</td>
          </tr></tbody>
        </table>
      </div>
      <div style="margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:12px;">
          <thead><tr>
            <th colspan="2" style="border:1px solid #000;padding:8px;text-align:center;font-weight:bold;width:70%;">Particulars</th>
            <th style="border:1px solid #000;padding:8px;text-align:center;font-weight:bold;width:5%;">L.F</th>
            <th style="border:1px solid #000;padding:8px;text-align:center;font-weight:bold;width:25%;">Rs.</th>
            <th style="border:1px solid #000;padding:8px;text-align:center;font-weight:bold;width:5%;">P</th>
          </tr></thead>
          <tbody>
            ${partRows}
            <tr style="font-weight:bold;">
              <td colspan="2" style="border:1px solid #000;padding:8px;"><strong>Total</strong></td>
              <td style="border:1px solid #000;padding:8px;"></td>
              <td style="border:1px solid #000;padding:8px;text-align:center;">Rs.${amountpaid.toLocaleString("en-IN")}</td>
              <td style="border:1px solid #000;padding:8px;"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="font-size:11px;font-style:italic;margin-bottom:32px;">
        *If 30% of the booking amount is not paid within 20 days from the date of booking, 10% penalty apply.
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:40px;">
        <div>Party's Signature</div>
        <div>President/Secretary</div>
      </div>
    </div>`;
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const generateReceiptPDF = async (receipt) => {
  const filename = `Receipt_${(receipt.receipt_no || "draft").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  // ── Strategy 1: Backend proxy-streams the PDF — no Cloudinary 401 issues ────
  try {
    const token =
      localStorage.getItem("memberToken") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("superAdminToken");

    const res = await fetch(`${API_BASE}/receipts/${receipt._id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.ok) {
      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("application/pdf")) {
        // ✅ Backend streamed the PDF directly — download it as a blob
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return; // ✅ exact original PDF downloaded
      }

      // Fallback: backend returned JSON with pdfUrl (old behaviour)
      const data = await res.json();
      if (data.success && data.pdfUrl) {
        const a = document.createElement("a");
        a.href = data.pdfUrl;
        a.download = filename;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
    }
    // 404 = no pdfUrl stored (old receipt) → fall through to regenerate
  } catch (err) {
    console.warn(
      "Backend PDF fetch failed, falling back to re-generate:",
      err.message,
    );
  }

  // ── Strategy 2: Re-generate on the fly (old receipts — no pdfUrl in DB) ───
  const html2canvas = (await import("html2canvas")).default;
  const jsPDF = (await import("jspdf")).default;

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:794px;background:#fff;";
  container.innerHTML = buildReceiptHTML(receipt);
  document.body.appendChild(container);

  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const canvas = await html2canvas(container, {
      scale: 1,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pdfW = 210,
      pdfH = 297;
    const imgH = (canvas.height * pdfW) / canvas.width;
    let fw = pdfW,
      fh = imgH;
    if (imgH > pdfH) {
      fh = pdfH;
      fw = (canvas.width * pdfH) / canvas.height;
    }
    pdf.addImage(imgData, "JPEG", (pdfW - fw) / 2, 0, fw, fh);
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
};
