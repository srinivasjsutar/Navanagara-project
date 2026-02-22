import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { Header } from "./Header";

// Project types with their shortforms
const PROJECT_TYPES = [
  { name: "New City", code: "NCG" },
  { name: "New City 1", code: "NCS" },
];

// Default form values
const defaultFormData = {
  societyName: "NAVANAGARA HOUSE BUILDING CO-OPERATIVE SOCIETY LTD.",
  societyNameKannada: "ನವನಗರ ಹೌಸ್ ಬಿಲ್ಡಿಂಗ್ ಕೋ-ಆಪರೇಟಿವ್ ಸೊಸೈಟಿ ಲಿ.",
  societyAddress:
    "No.1123, 'A' Block, 20th Cross, Sahakara Nagar, Bangalore - 560092",
  regNo: "Reg. No: JRB/RGN/CR-04/51588/2024-2025",
  website: "www.navanagarahousebuildingsociety.in",
  email: "Email-navanagarahousingsociety@gmail.com",
  receiptNo: "",
  receiptDate: new Date().toISOString().split("T")[0],
  receivedFrom: "",
  membershipId: "",
  phoneNumber: "",
  Email: "",
  siteDimension: "",
  flatNumber: "",
  projectType: "New City",
  seniorityNumber: "",
  paymentMode: "Cheque",
  bankName: "State Bank Of India",
  branch: "",
  chequeNo: "",
};

// Payment items list
const paymentItemsList = [
  "Share",
  "Membership Fee",
  "Admission Fee",
  "Share Fee",
  "Deposits",
  "Booking Advance",
  "Down Payment",
  "1st Installment",
  "2nd Installment",
  "3rd Installment",
  "Penalty",
  "Miscellaneous",
];

// Membership fee breakdown for new members
const MEMBERSHIP_BREAKDOWN = {
  Share: 2000,
  "Membership Fee": 200,
  "Admission Fee": 150,
  "Share Fee": 150,
};

const TOTAL_MEMBERSHIP_FEE = 2500;

const ReceiptForm = ({ initialData = {}, onReceiptGenerate = null }) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [paymentItemsError, setPaymentItemsError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [memberExists, setMemberExists] = useState(false);
  const [hasExistingReceipt, setHasExistingReceipt] = useState(false);
  const [memberValidationMessage, setMemberValidationMessage] = useState("");
  const [isCheckingMember, setIsCheckingMember] = useState(false);
  const receiptRef = useRef(null);
  const [memberAddresses, setMemberAddresses] = useState([]);

  // Multiple Transaction IDs (min 1, max 3)
  const [transactionIds, setTransactionIds] = useState([""]);

  // Multiple Banks (min 1, max 3)
  const [selectedBanks, setSelectedBanks] = useState([
    { bank: "State Bank Of India", branch: "" },
  ]);

  // Multiple Booking Advance rows with checked field
  const [bookingAdvanceRows, setBookingAdvanceRows] = useState([
    { amount: 0, checked: false },
  ]);

  // Dropdown options
  const paymentModes = [
    "Cheque",
    "Cash",
    "Online Transfer",
    "DD",
    "UPI",
    "NEFT/RTGS",
  ];

  const banks = [
    "State Bank Of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Kotak Mahindra Bank",
    "IndusInd Bank",
  ];

  // Initialize payment items — remove Booking Advance from list (handled separately)
  const [paymentItems, setPaymentItems] = useState(
    paymentItemsList
      .filter((item) => item !== "Booking Advance")
      .map((item) => ({
        name: item,
        checked: false,
        amount: 0,
      })),
  );

  // Transaction ID Handlers
  const addTransactionId = () => {
    if (transactionIds.length < 3) {
      setTransactionIds([...transactionIds, ""]);
    }
  };

  const removeTransactionId = (index) => {
    if (transactionIds.length > 1) {
      const updated = transactionIds.filter((_, i) => i !== index);
      setTransactionIds(updated);
      formik.setFieldValue("chequeNo", updated[0] || "");
    }
  };

  const updateTransactionId = (index, value) => {
    const updated = [...transactionIds];
    updated[index] = value;
    setTransactionIds(updated);
    formik.setFieldValue("chequeNo", updated[0] || "");
  };

  // Bank Handlers
  const addBank = () => {
    if (selectedBanks.length < 3) {
      setSelectedBanks([...selectedBanks, { bank: "", branch: "" }]);
    }
  };

  const removeBank = (index) => {
    if (selectedBanks.length > 1) {
      const updated = selectedBanks.filter((_, i) => i !== index);
      setSelectedBanks(updated);
      formik.setFieldValue("bankName", updated[0]?.bank || "");
      formik.setFieldValue("branch", updated[0]?.branch || "");
    }
  };

  const updateBankField = (index, field, value) => {
    const updated = [...selectedBanks];
    updated[index][field] = value;
    setSelectedBanks(updated);
    formik.setFieldValue("bankName", updated[0]?.bank || "");
    formik.setFieldValue("branch", updated[0]?.branch || "");
  };

  // Booking Advance Handlers
  const addBookingAdvanceRow = () => {
    if (bookingAdvanceRows.length < 3) {
      setBookingAdvanceRows([
        ...bookingAdvanceRows,
        { amount: 0, checked: false },
      ]);
    }
  };

  const removeBookingAdvanceRow = (index) => {
    if (bookingAdvanceRows.length > 1) {
      setBookingAdvanceRows(bookingAdvanceRows.filter((_, i) => i !== index));
    }
  };

  const updateBookingAdvanceRow = (index, field, value) => {
    const updated = [...bookingAdvanceRows];
    updated[index] = { ...updated[index], [field]: value };
    setBookingAdvanceRows(updated);
  };

  // Check if member exists and if they have existing receipts
  const checkMemberAndReceipts = async (seniorityNumber) => {
    if (!seniorityNumber || seniorityNumber.length < 3) {
      setMemberExists(false);
      setHasExistingReceipt(false);
      setMemberValidationMessage("");
      setMemberAddresses([]);
      return;
    }

    setIsCheckingMember(true);

    try {
      const membersResponse = await axios.get("http://localhost:3001/members");
      const members = membersResponse.data.data || [];
      const memberFound = members.find(
        (m) => m.seniority_no === seniorityNumber,
      );

      const sitebookingsResponse = await axios.get(
        "http://localhost:3001/sitebookings",
      );
      const sitebookings = sitebookingsResponse.data || [];
      const siteBookingFound = sitebookings.find(
        (s) => s.seniority_no === seniorityNumber,
      );

      const exists = !!(memberFound && siteBookingFound);
      setMemberExists(exists);

      if (memberFound && !siteBookingFound) {
        setMemberValidationMessage(
          "⚠️ Member found but no Site Booking exists. Please create a Site Booking first.",
        );
        setIsCheckingMember(false);
        return;
      }

      if (exists) {
        const foundMember = memberFound || siteBookingFound;
        if (foundMember && foundMember.name) {
          formik.setFieldValue("receivedFrom", foundMember.name);
        }
        if (foundMember && foundMember.email) {
          formik.setFieldValue("Email", foundMember.email);
        }
        if (foundMember && foundMember.mobile) {
          formik.setFieldValue("phoneNumber", foundMember.mobile);
        }
        if (siteBookingFound && siteBookingFound.sitedimension) {
          formik.setFieldValue("siteDimension", siteBookingFound.sitedimension);
        }

        // ── Auto-fill address from member's saved addresses ──────────────────
        const addresses = [];
        if (memberFound?.permanentaddress) addresses.push({ label: "Permanent Address", value: memberFound.permanentaddress });
        if (memberFound?.correspondenceaddress) addresses.push({ label: "Correspondence Address", value: memberFound.correspondenceaddress });
        setMemberAddresses(addresses);
        // Auto-select the first address
        if (addresses.length > 0) {
          formik.setFieldValue("flatNumber", addresses[0].value);
        }

        const receiptsResponse = await axios.get(
          "http://localhost:3001/receipts",
        );
        const receipts = receiptsResponse.data.data || [];
        const existingReceipt = receipts.find(
          (r) => r.seniority_no === seniorityNumber,
        );

        setHasExistingReceipt(!!existingReceipt);

        if (existingReceipt) {
          setMemberValidationMessage(
            "✅ Member found. Previous receipt exists - No membership fee required.",
          );
        } else {
          setMemberValidationMessage(
            "✅ Member found. First receipt - ₹2,500 membership fee will be adjusted from your payment.",
          );
        }
      } else {
        setMemberValidationMessage(
          "❌ Member not found. Please add member first in Members or Site Booking.",
        );
      }
    } catch (error) {
      console.error("Error checking member:", error);
      setMemberValidationMessage(
        "⚠️ Error checking member details. Please check your connection.",
      );
      setMemberExists(false);
    } finally {
      setIsCheckingMember(false);
    }
  };

  // Validation Schema
  const validationSchema = Yup.object().shape({
    receiptNo: Yup.string()
      .required("Receipt number is required")
      .matches(
        /^[A-Z0-9-/]+$/i,
        "Only letters, numbers, hyphens, and slashes allowed",
      ),
    receiptDate: Yup.date().required("Date is required"),
    receivedFrom: Yup.string()
      .required("Received from name is required")
      .min(2, "Minimum 2 characters required")
      .matches(/^[a-zA-Z\s.]+$/, "Only letters, spaces, and periods allowed"),
    phoneNumber: Yup.string()
      .matches(
        /^(\+?[1-9]\d{0,3}|0)?[6-9]\d{9}$/,
        "Enter a valid contact number",
      )
      .required("Phone number is required"),
    Email: Yup.string()
      .required("Email is required")
      .email("Enter valid email"),
    flatNumber: Yup.string()
      .required("Address is required")
      .min(10, "Please provide complete address (minimum 10 characters)"),
    seniorityNumber: Yup.string().required("Seniority number is required"),
    paymentMode: Yup.string().required("Payment mode is required"),
    bankName: Yup.string().when("paymentMode", {
      is: (val) => val !== "Cash",
      then: (schema) =>
        schema.required("Bank name required for non-cash payments"),
      otherwise: (schema) => schema.notRequired(),
    }),
    branch: Yup.string().when("paymentMode", {
      is: (val) => val !== "Cash",
      then: (schema) =>
        schema.required("Branch name required for non-cash payments"),
      otherwise: (schema) => schema.notRequired(),
    }),
    chequeNo: Yup.string().when("paymentMode", {
      is: (val) => val !== "Cash",
      then: (schema) => schema.required("Transaction ID is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: { ...defaultFormData, ...initialData },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      if (validatePaymentItems()) {
        setShowReceipt(true);
      }
    },
  });

  // Check member and receipts when seniority number changes
  useEffect(() => {
    checkMemberAndReceipts(formik.values.seniorityNumber);
  }, [formik.values.seniorityNumber]);

  // Validate payment items
  const validatePaymentItems = () => {
    const checkedItems = paymentItems.filter(
      (item) => item.checked && parseFloat(item.amount || 0) > 0,
    );
    const bookingAdvanceTotal = bookingAdvanceRows.reduce(
      (sum, row) => sum + (row.checked ? parseFloat(row.amount) || 0 : 0),
      0,
    );

    if (checkedItems.length === 0 && bookingAdvanceTotal === 0) {
      setPaymentItemsError(
        "Select at least one payment item with valid amount",
      );
      return false;
    }

    const total = calculateTotal();
    if (total === 0) {
      setPaymentItemsError("Total amount cannot be zero");
      return false;
    }

    setPaymentItemsError("");
    return true;
  };

  // Handle payment item changes
  const handlePaymentItemChange = (index, field, value) => {
    setPaymentItems((prev) => {
      const updated = [...prev];
      const itemName = updated[index].name;

      if (field === "checked") {
        if (MEMBERSHIP_BREAKDOWN[itemName] !== undefined) {
          updated[index] = {
            ...updated[index],
            checked: value,
            amount: value ? MEMBERSHIP_BREAKDOWN[itemName] : 0,
          };
        } else {
          updated[index] = { ...updated[index], [field]: value };
        }
      } else if (field === "amount") {
        if (MEMBERSHIP_BREAKDOWN[itemName] === undefined) {
          const numValue = parseFloat(value);
          if (
            value === "" ||
            (!isNaN(numValue) && numValue >= 0 && numValue <= 100000000)
          ) {
            updated[index] = { ...updated[index], [field]: value };
          }
        }
      }

      return updated;
    });

    if (field === "checked" && value === true) {
      setPaymentItemsError("");
    }
  };

  // Convert number to words
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

    if (num === 0) return "Zero";

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
      );
    };

    if (num < 1000) return convertLessThanThousand(num);

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = "";
    if (crore > 0) result += convertLessThanThousand(crore) + " Crore ";
    if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh ";
    if (thousand > 0)
      result += convertLessThanThousand(thousand) + " Thousand ";
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim();
  };

  // Calculate total — always uses raw entered amounts
  const calculateTotal = () => {
    const itemsTotal = paymentItems.reduce((sum, item) => {
      return sum + (item.checked ? parseFloat(item.amount || 0) : 0);
    }, 0);
    const bookingAdvanceTotal = bookingAdvanceRows.reduce(
      (sum, row) => sum + (row.checked ? parseFloat(row.amount) || 0 : 0),
      0,
    );
    return itemsTotal + bookingAdvanceTotal;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Download PDF and Email — captures ReceiptContent via html2canvas (same as preview)
  const handleDownloadPDF = async () => {
    if (!memberExists) {
      toast.error(
        "❌ Member not found! Please add the member in Members or Site Booking first.",
      );
      return;
    }

    const errors = await formik.validateForm();
    formik.setTouched({
      receiptNo: true,
      receiptDate: true,
      receivedFrom: true,
      phoneNumber: true,
      Email: true,
      flatNumber: true,
      seniorityNumber: true,
      bankName: true,
      branch: true,
      chequeNo: true,
    });

    if (Object.keys(errors).length === 0 && validatePaymentItems()) {
      try {
        setIsGeneratingPDF(true);

        const html2canvas = (await import("html2canvas")).default;
        const { default: jsPDF } = await import("jspdf");

        // ── Render ReceiptContent into a hidden off-screen container ──────────
        // This captures the EXACT same HTML as the preview modal
        const container = document.createElement("div");
        container.style.cssText =
          "position:fixed;left:-9999px;top:0;width:794px;background:#fff;padding:10mm 8mm;box-sizing:border-box;";

        // Mount a temporary React root to render ReceiptContent into container
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(container);
        document.body.appendChild(container);

        await new Promise((resolve) => {
          root.render(<ReceiptContent />);
          // Wait for images (logo) to load
          setTimeout(resolve, 800);
        });

        // ── Capture with html2canvas ──────────────────────────────────────────
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: 794,
        });

        root.unmount();
        document.body.removeChild(container);

        // ── Convert canvas to PDF ─────────────────────────────────────────────
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = 210;
        const pdfHeight = 297;
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let finalWidth = imgWidth;
        let finalHeight = imgHeight;
        if (imgHeight > pdfHeight) {
          finalHeight = pdfHeight;
          finalWidth = (canvas.width * pdfHeight) / canvas.height;
        }

        const xOffset = (pdfWidth - finalWidth) / 2;
        pdf.addImage(imgData, "JPEG", xOffset, 0, finalWidth, finalHeight);

        // ── Build payload for backend (Cloudinary + email) ────────────────────
        const filename = `Receipt_${(formik.values.receiptNo || "draft").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        const pdfBase64 = pdf.output("datauristring").split(",")[1];

        const checkedBookingAdvances = bookingAdvanceRows.filter(
          (row) => row.checked && parseFloat(row.amount || 0) > 0,
        );
        const paymentTypeStr = [
          ...paymentItems
            .filter((i) => i.checked && parseFloat(i.amount || 0) > 0)
            .map((i) => i.name),
          ...checkedBookingAdvances.map((_, i) =>
            checkedBookingAdvances.length > 1
              ? `Booking Advance ${i + 1}`
              : "Booking Advance",
          ),
        ].join(", ");

        try {
          const receiptPayload = {
            receiptNo: formik.values.receiptNo,
            membershipid: formik.values.seniorityNumber,
            name: formik.values.receivedFrom,
            projectname: formik.values.projectType,
            date: formik.values.receiptDate,
            amountpaid: total,
            mobilenumber: formik.values.phoneNumber,
            email: formik.values.Email,
            paymentmode: formik.values.paymentMode,
            paymenttype: paymentTypeStr,
            transactionid: transactionIds.filter(Boolean).join(", "),
            dimension: formik.values.siteDimension || "N/A",
            bank: selectedBanks
              .map((b) => b.bank)
              .filter(Boolean)
              .join(", "),
            created_by: "Admin",
            pdfBase64,
            pdfFilename: filename,
          };

          const response = await axios.post(
            "http://localhost:3001/receipt",
            receiptPayload,
          );
          if (response.data.success) {
            pdf.save(filename);
            toast.success(
              "✅ Receipt generated, downloaded and emailed successfully!",
            );
          }
        } catch (backendError) {
          console.error("⚠️ Backend error:", backendError);
          pdf.save(filename);
          toast.warning(
            "Receipt downloaded locally but cloud storage/email failed.",
          );
        }

        setIsGeneratingPDF(false);
      } catch (error) {
        console.error("Error generating receipt:", error);
        toast.error(`Failed to generate receipt: ${error.message}`);
        setIsGeneratingPDF(false);
      }
    } else {
      setIsGeneratingPDF(false);
    }
  };

  const total = calculateTotal();
  const amountInWords = numberToWords(total);

  const shouldApplyMembershipFeeAdjustment = () => {
    if (!memberExists || hasExistingReceipt) return false;

    const userSelectedMembershipItems = paymentItems.some(
      (item) => item.checked && MEMBERSHIP_BREAKDOWN[item.name] !== undefined,
    );
    return !userSelectedMembershipItems;
  };

  const getAdjustedBreakdownData = () => {
    const adjustedItems = paymentItems.map((item) => ({ ...item }));
    const adjustedAdvance = bookingAdvanceRows.map((row) => ({ ...row }));

    if (!shouldApplyMembershipFeeAdjustment()) {
      return { adjustedItems, adjustedAdvance };
    }

    let remaining = TOTAL_MEMBERSHIP_FEE;

    // 1️⃣ Deduct from regular payment items first
    for (let i = 0; i < adjustedItems.length; i++) {
      const item = adjustedItems[i];

      if (
        item.checked &&
        !MEMBERSHIP_BREAKDOWN[item.name] &&
        parseFloat(item.amount) > 0 &&
        remaining > 0
      ) {
        const amt = parseFloat(item.amount);

        if (amt >= remaining) {
          adjustedItems[i].amount = amt - remaining;
          remaining = 0;
          break;
        } else {
          adjustedItems[i].amount = 0;
          remaining -= amt;
        }
      }
    }

    // 2️⃣ If still remaining, deduct from booking advance
    if (remaining > 0) {
      for (let i = 0; i < adjustedAdvance.length; i++) {
        if (
          adjustedAdvance[i].checked &&
          parseFloat(adjustedAdvance[i].amount) > 0 &&
          remaining > 0
        ) {
          const amt = parseFloat(adjustedAdvance[i].amount);

          if (amt >= remaining) {
            adjustedAdvance[i].amount = amt - remaining;
            remaining = 0;
            break;
          } else {
            adjustedAdvance[i].amount = 0;
            remaining -= amt;
          }
        }
      }
    }

    // 3️⃣ Add membership breakdown rows
    if (remaining === 0) {
      Object.keys(MEMBERSHIP_BREAKDOWN).forEach((itemName) => {
        const index = adjustedItems.findIndex((i) => i.name === itemName);
        if (index !== -1) {
          adjustedItems[index] = {
            ...adjustedItems[index],
            checked: true,
            amount: MEMBERSHIP_BREAKDOWN[itemName],
          };
        }
      });
    }

    return { adjustedItems, adjustedAdvance };
  };

  const { adjustedItems, adjustedAdvance } = getAdjustedBreakdownData();

  const getAllCheckedItems = () => {
    const items = paymentItems.filter(
      (item) =>
        item.checked && item.amount > 0 && !MEMBERSHIP_BREAKDOWN[item.name],
    );

    // ✅ RAW rows — show exactly what was entered, no deduction
    const checkedAdvanceRows = bookingAdvanceRows.filter(
      (row) => row.checked && parseFloat(row.amount) > 0,
    );

    const advanceItems = checkedAdvanceRows.map((row, i) => ({
      name:
        checkedAdvanceRows.length > 1
          ? `Booking Advance ${i + 1}`
          : "Booking Advance",
      amount: row.amount,
      checked: true,
    }));

    return [...items, ...advanceItems];
  };

  // Receipt Content Component — Doc1 style/layout with Doc2 data logic
  const ReceiptContent = () => (
    <div
      style={{
        border: "2px solid #000000",
        backgroundColor: "#ffffff",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header with Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "150px",
          borderBottom: "2px solid #000000",
          paddingBottom: "0px",
          paddingTop: "0px",
          marginBottom: "16px",
          marginLeft: "-20px",
          marginRight: "-20px",
          paddingLeft: "10px",
          paddingRight: "10px",
          gap: "10px",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <img
            src={formik.values.logo || "/images/logo.svg"}
            alt="Logo"
            style={{
              width: "170px",
              height: "170px",
              marginBottom: "20px",
              objectFit: "contain",
            }}
          />
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            {formik.values.societyNameKannada}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            {formik.values.societyName}
          </div>
          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
            {formik.values.societyAddress}
          </div>
          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
            {formik.values.regNo}
          </div>
          <div style={{ fontSize: "11px" }}>
            <a
              href={`https://${formik.values.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#000000",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {formik.values.website}
            </a>
            {" / "}
            <a
              href={`mailto:${formik.values.email}`}
              style={{
                color: "#000000",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {formik.values.email}
            </a>
          </div>
        </div>
        <div style={{ width: "80px", flexShrink: 0 }}></div>
      </div>

      {/* RECEIPT Label */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <span
          style={{
            border: "2px solid #000000",
            fontWeight: "bold",
            fontSize: "14px",
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingTop: "5px",
            paddingBottom: "18px",
          }}
        >
          RECEIPT
        </span>
      </div>

      {/* Receipt Number and Date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
          fontSize: "13px",
          fontWeight: "bold",
        }}
      >
        <div>RECEIPT No. {formik.values.receiptNo}</div>
        <div>Date: {formatDate(formik.values.receiptDate)}</div>
      </div>

      {/* Received From Section */}
      <div style={{ fontSize: "13px", marginBottom: "16px" }}>
        <div style={{ marginBottom: "4px" }}>
          <strong>
            Received From Smt./Shree: {formik.values.receivedFrom}
          </strong>
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Address: {formik.values.flatNumber}</strong>
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Rupees: {amountInWords} Only.</strong>
        </div>
        <div>
          <strong>
            Seniority Number: {formik.values.projectType} (
            {formik.values.seniorityNumber})
          </strong>
        </div>
      </div>

      {/* Table 1: Payment Details — RAW entered amounts, only selected items */}
      <div style={{ marginBottom: "16px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000000",
            fontSize: "11px",
          }}
        >
          <thead>
            <tr>
              {[
                "S.No",
                "Payment Type",
                "Payment Mode",
                "Bank",
                "Branch",
                "Cheque/Transaction ID",
                "Amount",
              ].map((header, i) => (
                <th
                  key={i}
                  style={{
                    border: "1px solid #000000",
                    padding: "6px",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "10px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getAllCheckedItems().map((item, index) => {
              const bank = selectedBanks[index] || selectedBanks[0];
              const transactionId = transactionIds[index] || transactionIds[0];
              return (
                <tr key={index}>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {formik.values.paymentMode}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {formik.values.paymentMode === "Cash"
                      ? ""
                      : bank?.bank || ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {formik.values.paymentMode === "Cash"
                      ? ""
                      : bank?.branch || ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {formik.values.paymentMode === "Cash"
                      ? ""
                      : transactionId || ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000000",
                      padding: "6px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    {item.amount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table 2: Particulars Breakdown — ALL items, adjusted amounts, dash for unselected */}
      <div style={{ marginBottom: "16px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000000",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan="2"
                style={{
                  border: "1px solid #000000",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  width: "70%",
                  backgroundColor: "#f0f0f0",
                }}
              >
                Particulars
              </th>
              <th
                style={{
                  border: "1px solid #000000",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  width: "5%",
                  backgroundColor: "#f0f0f0",
                }}
              >
                L.F
              </th>
              <th
                style={{
                  border: "1px solid #000000",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  width: "20%",
                  backgroundColor: "#f0f0f0",
                }}
              >
                Rs.
              </th>
              <th
                style={{
                  border: "1px solid #000000",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  width: "5%",
                  backgroundColor: "#f0f0f0",
                }}
              >
                P
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ALL regular payment items — adjusted amounts — "-" for unchecked */}
            {adjustedItems.map((item, index) => {
              const hasAmount = item.checked && parseFloat(item.amount) > 0;
              return (
                <tr key={index}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                      width: "5%",
                    }}
                  >
                    {index + 1}.
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {item.name}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}></td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {hasAmount ? item.amount : "-"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}></td>
                </tr>
              );
            })}

            {/* ALL Booking Advance rows — adjusted amounts — "-" for unchecked */}
            {bookingAdvanceRows.map((row, index) => {
              const hasAmount = row.checked && parseFloat(row.amount) > 0;
              const displayAmount = hasAmount
                ? (adjustedAdvance[index]?.amount ?? row.amount)
                : null;
              return (
                <tr key={`ba-${index}`}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {adjustedItems.length + index + 1}.
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {bookingAdvanceRows.length > 1
                      ? `Booking Advance ${index + 1}`
                      : "Booking Advance"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}></td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {displayAmount !== null && parseFloat(displayAmount) > 0
                      ? displayAmount
                      : "-"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}></td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr style={{ fontWeight: "bold" }}>
              <td
                colSpan="2"
                style={{ border: "1px solid #000000", padding: "8px" }}
              >
                <strong>Total</strong>
              </td>
              <td style={{ border: "1px solid #000000", padding: "8px" }}></td>
              <td
                style={{
                  border: "1px solid #000000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <strong>{total}</strong>
              </td>
              <td style={{ border: "1px solid #000000", padding: "8px" }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div
        style={{ fontSize: "11px", fontStyle: "italic", marginBottom: "32px" }}
      >
        *If 30% of the booking amount is not paid within 20 days from the date
        of booking, 10% penalty apply.
      </div>

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          marginTop: "40px",
        }}
      >
        <div>Party's Signature</div>
        <div>President/Secretary</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          html, body { height: 100%; overflow: visible; }
          .no-print { display: none !important; }
          .print-container { display: block !important; position: relative !important; left: 0 !important; visibility: visible !important; }
          .a4-receipt { box-shadow: none !important; margin: 0 !important; width: 210mm !important; min-height: 297mm !important; padding: 10mm 8mm !important; page-break-after: avoid !important; display: block !important; visibility: visible !important; }
          @page { size: A4 portrait; margin: 0; }
        }
        body { background: white !important; }
        .a4-receipt { width: 210mm; min-height: 297mm; padding: 10mm 8mm; background: white; margin: 0 auto; box-sizing: border-box; }
        .receipt-panel { font-family: Arial, sans-serif; }
      `}</style>

      <div>
        <Header />
      </div>

      <div className="max-w-4xl px-[50px] p-6">
        <h2 className="text-[24px] font-semibold text-gray-800 mb-4 mt-2">
          Receipt Form
        </h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="no-print bg-[#FAF9FF] rounded-lg shadow-sm p-5">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Receipt Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Receipt Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiptNo"
                    value={formik.values.receiptNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., RCP/2024/001"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.receiptNo && formik.errors.receiptNo
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {formik.touched.receiptNo && formik.errors.receiptNo && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.receiptNo}
                    </p>
                  )}
                </div>

                {/* Seniority Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seniority Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="seniorityNumber"
                    value={formik.values.seniorityNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="NCG-001"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.seniorityNumber &&
                      formik.errors.seniorityNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {isCheckingMember && (
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-800">
                        🔍 Checking member...
                      </p>
                    </div>
                  )}
                  {memberValidationMessage && !isCheckingMember && (
                    <div
                      className={`mt-1 p-2 border rounded-md ${
                        memberExists
                          ? hasExistingReceipt
                            ? "bg-green-50 border-green-200"
                            : "bg-yellow-50 border-yellow-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          memberExists
                            ? hasExistingReceipt
                              ? "text-green-800"
                              : "text-yellow-800"
                            : "text-red-800"
                        }`}
                      >
                        {memberValidationMessage}
                      </p>
                    </div>
                  )}
                  {formik.touched.seniorityNumber &&
                    formik.errors.seniorityNumber && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {formik.errors.seniorityNumber}
                      </p>
                    )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="receivedFrom"
                    value={formik.values.receivedFrom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Auto-filled from database"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.receivedFrom && formik.errors.receivedFrom
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {formik.touched.receivedFrom &&
                    formik.errors.receivedFrom && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {formik.errors.receivedFrom}
                      </p>
                    )}
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="projectType"
                    value={formik.values.projectType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {PROJECT_TYPES.map((project) => (
                      <option key={project.name} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMode"
                    value={formik.values.paymentMode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {paymentModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction IDs */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Transaction ID <span className="text-red-500">*</span>
                    <span className="text-gray-400 ml-1">(max 3)</span>
                  </label>
                  {transactionIds.map((tid, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tid}
                        onChange={(e) =>
                          updateTransactionId(index, e.target.value)
                        }
                        placeholder={`Transaction ID ${index + 1}`}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      {transactionIds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTransactionId(index)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {transactionIds.length < 3 && (
                    <button
                      type="button"
                      onClick={addTransactionId}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      + Add Transaction ID
                    </button>
                  )}
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Paid Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={`₹${total.toLocaleString()}`}
                    readOnly
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                  />
                </div>

                {/* Site Dimension */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Site Dimension
                  </label>
                  <input
                    type="text"
                    name="siteDimension"
                    value={formik.values.siteDimension}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., 30x40"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-filled from Site Booking if available
                  </p>
                </div>

                {/* Bank & Branch */}
                {formik.values.paymentMode !== "Cash" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bank & Branch <span className="text-red-500">*</span>
                      <span className="text-gray-400 ml-1">(max 3)</span>
                    </label>
                    {selectedBanks.map((bankEntry, index) => (
                      <div key={index} className="flex gap-2 mb-2 items-start">
                        <div className="flex-1">
                          <select
                            value={bankEntry.bank}
                            onChange={(e) =>
                              updateBankField(index, "bank", e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="">Select Bank</option>
                            {banks.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={bankEntry.branch}
                            onChange={(e) =>
                              updateBankField(index, "branch", e.target.value)
                            }
                            placeholder="Enter branch name"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        {selectedBanks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBank(index)}
                            className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {selectedBanks.length < 3 && (
                      <button
                        type="button"
                        onClick={addBank}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Add Bank
                      </button>
                    )}
                  </div>
                )}

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Auto-filled from database"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.phoneNumber && formik.errors.phoneNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="Email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.Email}
                    placeholder="Auto-filled from database"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.Email && formik.errors.Email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {formik.touched.Email && formik.errors.Email && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.Email}
                    </div>
                  )}
                </div>

                {/* Receipt Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Receipt Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="receiptDate"
                    value={formik.values.receiptDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.receiptDate && formik.errors.receiptDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {formik.touched.receiptDate && formik.errors.receiptDate && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.receiptDate}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>

                  {/* Dropdown — shows member's saved addresses to pick from */}
                  {memberAddresses.length > 0 && (
                    <select
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white mb-2"
                      value={formik.values.flatNumber}
                      onChange={(e) => {
                        formik.setFieldValue("flatNumber", e.target.value);
                      }}
                    >
                      <option value="" disabled>— Select a saved address —</option>
                      {memberAddresses.map((addr, idx) => (
                        <option key={idx} value={addr.value}>
                          {addr.label}: {addr.value}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Editable textarea — always shown, can type custom address */}
                  <textarea
                    name="flatNumber"
                    value={formik.values.flatNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows="2"
                    placeholder="Complete address with pincode"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      formik.touched.flatNumber && formik.errors.flatNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                  {memberAddresses.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">Select from dropdown or type a custom address above</p>
                  )}
                  {formik.touched.flatNumber && formik.errors.flatNumber && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.flatNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Payment Items <span className="text-red-500">*</span>
                </h3>

                {paymentItemsError && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-xs font-semibold">
                      {paymentItemsError}
                    </p>
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 mb-3">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {paymentItems.map((item, index) => {
                      const isMembershipItem =
                        MEMBERSHIP_BREAKDOWN[item.name] !== undefined;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition"
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) =>
                              handlePaymentItemChange(
                                index,
                                "checked",
                                e.target.checked,
                              )
                            }
                            className="w-3.5 h-3.5 cursor-pointer flex-shrink-0"
                          />
                          <label className="flex-1 text-xs font-medium text-gray-700 min-w-0">
                            {item.name}
                            {isMembershipItem && (
                              <span className="ml-1 text-xs text-blue-600">
                                (₹{MEMBERSHIP_BREAKDOWN[item.name]})
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={item.amount || ""}
                            onChange={(e) =>
                              handlePaymentItemChange(
                                index,
                                "amount",
                                e.target.value,
                              )
                            }
                            disabled={isMembershipItem}
                            placeholder="₹"
                            min="0"
                            max="100000000"
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:outline-none disabled:bg-gray-100 flex-shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Advance rows */}
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-semibold text-gray-700">
                      Booking Advance
                      <span className="text-gray-400 ml-1">(max 3)</span>
                    </h4>
                    {bookingAdvanceRows.length < 3 && (
                      <button
                        type="button"
                        onClick={addBookingAdvanceRow}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Add Row
                      </button>
                    )}
                  </div>

                  {bookingAdvanceRows.map((row, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <input
                        type="checkbox"
                        checked={row.checked}
                        onChange={(e) =>
                          updateBookingAdvanceRow(
                            index,
                            "checked",
                            e.target.checked,
                          )
                        }
                        className="w-3.5 h-3.5 cursor-pointer flex-shrink-0"
                      />
                      <label className="text-xs text-gray-600 w-32 flex-shrink-0">
                        {bookingAdvanceRows.length > 1
                          ? `Booking Advance ${index + 1}`
                          : "Booking Advance"}
                      </label>
                      <input
                        type="number"
                        value={row.amount || ""}
                        onChange={(e) =>
                          updateBookingAdvanceRow(
                            index,
                            "amount",
                            e.target.value,
                          )
                        }
                        disabled={!row.checked}
                        placeholder="₹ Amount"
                        min="0"
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                      />
                      {bookingAdvanceRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBookingAdvanceRow(index)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div
                className={`border rounded-md p-3 ${
                  total > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`text-sm font-semibold ${total > 0 ? "text-green-800" : "text-gray-600"}`}
                >
                  Total Amount: ₹{total.toLocaleString("en-IN")}
                </div>
                <div
                  className={`text-xs mt-0.5 ${total > 0 ? "text-green-600" : "text-gray-500"}`}
                >
                  {total > 0
                    ? `${amountInWords} Rupees Only`
                    : "No amount selected"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-8 py-2 border-2 border-purple-500 text-purple-600 text-sm font-semibold rounded-full hover:bg-purple-50 transition-all duration-200"
                >
                  👁 Preview
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF || !memberExists}
                  className={`px-10 py-2 bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                    isGeneratingPDF || !memberExists
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isGeneratingPDF ? "Generating..." : "GENERATE RECEIPT"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Receipt preview still used for Preview Modal only */}
        <div style={{ display: "none" }}>
          <div ref={receiptRef} />
        </div>

        {/* Preview Modal */}
        {showPreviewModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[950px] max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-800">
                    Receipt Preview
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                    Preview Only
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleDownloadPDF();
                    }}
                    disabled={isGeneratingPDF || !memberExists}
                    className={`px-6 py-2 bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full hover:opacity-90 transition ${
                      isGeneratingPDF || !memberExists
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isGeneratingPDF ? "Generating..." : "Generate PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-6 bg-gray-100">
                <div
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    margin: "0 auto",
                    backgroundColor: "#ffffff",
                    padding: "10mm 8mm",
                    boxSizing: "border-box",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <ReceiptContent />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptForm;