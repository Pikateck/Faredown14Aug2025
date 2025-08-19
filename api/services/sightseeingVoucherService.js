/**
 * Sightseeing Voucher Generation Service
 * Generates PDF vouchers with QR codes for sightseeing bookings
 */

const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Pool } = require("pg");
const Voucher = require("../models/Voucher");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class SightseeingVoucherService {
  constructor() {
    this.voucherModel = new Voucher();
    this.vouchersDir = path.join(__dirname, "../../vouchers/sightseeing");

    // Ensure vouchers directory exists
    if (!fs.existsSync(this.vouchersDir)) {
      fs.mkdirSync(this.vouchersDir, { recursive: true });
    }
  }

  /**
   * Generate voucher for sightseeing booking
   */
  async generateVoucher(bookingId) {
    try {
      // Get booking details
      const booking = await this.getBookingDetails(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Generate QR code
      const qrCodeData = await this.generateQRCode(booking);

      // Generate PDF voucher
      const pdfPath = await this.generatePDFVoucher(booking, qrCodeData);

      // Save voucher record to database
      const voucherData = {
        booking_id: bookingId,
        voucher_type: "sightseeing",
        voucher_number: this.generateVoucherNumber(booking),
        pdf_path: pdfPath,
        pdf_size_bytes: fs.statSync(pdfPath).size,
        email_address: booking.guest_email,
      };

      const voucherRecord = await this.voucherModel.create(voucherData);

      return {
        success: true,
        voucher: voucherRecord.data,
        pdf_path: pdfPath,
        qr_code: qrCodeData.dataURL,
      };
    } catch (error) {
      console.error("Error generating sightseeing voucher:", error);
      throw error;
    }
  }

  /**
   * Get booking details from database
   */
  async getBookingDetails(bookingId) {
    const query = `
      SELECT 
        sb.*,
        si.activity_name,
        si.destination_name,
        si.main_image_url,
        si.includes,
        si.excludes,
        si.highlights,
        s.name as supplier_name,
        s.logo_url as supplier_logo
      FROM sightseeing_bookings sb
      LEFT JOIN sightseeing_items si ON sb.activity_code = si.activity_code
      LEFT JOIN suppliers s ON sb.supplier_id = s.id
      WHERE sb.id = $1
    `;

    const result = await pool.query(query, [bookingId]);
    if (result.rows.length === 0) return null;

    const booking = result.rows[0];

    // Parse guest details if it's JSON
    if (typeof booking.guest_details === "string") {
      booking.guest_details = JSON.parse(booking.guest_details);
    }

    // Extract primary guest info
    const primaryGuest = booking.guest_details?.primaryGuest || {};
    const contactInfo = booking.guest_details?.contactInfo || {};

    return {
      ...booking,
      guest_name:
        `${primaryGuest.firstName || ""} ${primaryGuest.lastName || ""}`.trim(),
      guest_email: contactInfo.email || "",
      guest_phone: contactInfo.phone || "",
    };
  }

  /**
   * Generate QR code for booking verification
   */
  async generateQRCode(booking) {
    const qrData = {
      type: "sightseeing_voucher",
      booking_ref: booking.booking_ref,
      activity_code: booking.activity_code,
      visit_date: booking.visit_date,
      visit_time: booking.visit_time,
      guests: booking.adults_count + booking.children_count,
      verification_url: `${process.env.FRONTEND_URL}/verify-voucher/${booking.booking_ref}`,
      generated_at: new Date().toISOString(),
    };

    const qrString = JSON.stringify(qrData);
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return {
      data: qrData,
      dataURL: qrCodeDataURL,
      string: qrString,
    };
  }

  /**
   * Generate PDF voucher document
   */
  async generatePDFVoucher(booking, qrCodeData) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `sightseeing-voucher-${booking.booking_ref}-${Date.now()}.pdf`;
        const pdfPath = path.join(this.vouchersDir, filename);

        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // Header
        doc
          .fontSize(24)
          .fillColor("#2563eb")
          .text("SIGHTSEEING VOUCHER", 50, 50, { align: "center" });

        doc
          .fontSize(14)
          .fillColor("#64748b")
          .text(
            "Experience voucher - Please present this to your operator",
            50,
            85,
            { align: "center" },
          );

        // Booking reference box
        doc.rect(50, 120, 495, 40).fillAndStroke("#f1f5f9", "#e2e8f0");

        doc
          .fontSize(18)
          .fillColor("#1e293b")
          .text(`Booking Reference: ${booking.booking_ref}`, 60, 135);

        // Activity details section
        let yPos = 180;

        // Activity name
        doc
          .fontSize(20)
          .fillColor("#1e293b")
          .text(booking.activity_name || "Activity", 50, yPos);

        yPos += 35;

        // Two column layout
        const leftColumn = 50;
        const rightColumn = 300;

        // Left column - Booking details
        doc
          .fontSize(12)
          .fillColor("#475569")
          .text("BOOKING DETAILS", leftColumn, yPos);

        yPos += 20;

        doc
          .fontSize(11)
          .fillColor("#1e293b")
          .text(`Guest: ${booking.guest_name}`, leftColumn, yPos);

        yPos += 15;
        doc.text(`Email: ${booking.guest_email}`, leftColumn, yPos);

        yPos += 15;
        doc.text(`Phone: ${booking.guest_phone}`, leftColumn, yPos);

        yPos += 15;
        doc.text(
          `Adults: ${booking.adults_count} | Children: ${booking.children_count}`,
          leftColumn,
          yPos,
        );

        // Right column - Visit details
        yPos = 200 + 20; // Reset to booking details section + header

        doc
          .fontSize(12)
          .fillColor("#475569")
          .text("VISIT DETAILS", rightColumn, yPos);

        yPos += 20;

        doc
          .fontSize(11)
          .fillColor("#1e293b")
          .text(
            `Date: ${new Date(booking.visit_date).toLocaleDateString()}`,
            rightColumn,
            yPos,
          );

        yPos += 15;
        if (booking.visit_time) {
          doc.text(`Time: ${booking.visit_time}`, rightColumn, yPos);
          yPos += 15;
        }

        doc.text(
          `Destination: ${booking.destination_name || "N/A"}`,
          rightColumn,
          yPos,
        );

        yPos += 15;
        doc.text(
          `Total Amount: ${booking.currency} ${booking.total_amount}`,
          rightColumn,
          yPos,
        );

        // Activity includes/highlights
        yPos += 40;

        if (booking.includes && booking.includes.length > 0) {
          doc
            .fontSize(12)
            .fillColor("#475569")
            .text("INCLUDES", leftColumn, yPos);

          yPos += 20;

          booking.includes.forEach((item, index) => {
            if (yPos > 700) {
              // Page break if needed
              doc.addPage();
              yPos = 50;
            }
            doc
              .fontSize(10)
              .fillColor("#1e293b")
              .text(`• ${item}`, leftColumn, yPos);
            yPos += 12;
          });
        }

        // QR Code section
        const qrYPos = 520;

        // QR Code box
        doc
          .rect(rightColumn - 20, qrYPos - 20, 240, 180)
          .fillAndStroke("#f8fafc", "#e2e8f0");

        doc
          .fontSize(12)
          .fillColor("#475569")
          .text("VERIFICATION QR CODE", rightColumn, qrYPos - 10);

        // Add QR code image
        const qrImageBuffer = Buffer.from(
          qrCodeData.dataURL.split(",")[1],
          "base64",
        );
        doc.image(qrImageBuffer, rightColumn + 20, qrYPos + 10, {
          width: 120,
          height: 120,
        });

        doc
          .fontSize(9)
          .fillColor("#64748b")
          .text("Scan to verify voucher", rightColumn + 30, qrYPos + 140, {
            width: 100,
            align: "center",
          });

        // Important notes section
        yPos = qrYPos + 200;

        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(12)
          .fillColor("#dc2626")
          .text("IMPORTANT NOTES", leftColumn, yPos);

        yPos += 20;

        const notes = [
          "Please arrive 15 minutes before your scheduled time",
          "Bring a valid photo ID for all participants",
          "This voucher must be presented to gain entry",
          "No refund for no-shows or late arrivals",
          "Weather conditions may affect the activity",
        ];

        notes.forEach((note) => {
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }
          doc
            .fontSize(10)
            .fillColor("#1e293b")
            .text(`• ${note}`, leftColumn, yPos);
          yPos += 15;
        });

        // Footer
        yPos = 750;
        doc
          .fontSize(8)
          .fillColor("#64748b")
          .text(
            `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
            leftColumn,
            yPos,
            { align: "center", width: 495 },
          );

        doc.text(
          "For support, contact: support@faredown.com | +1-800-FAREDOWN",
          leftColumn,
          yPos + 12,
          { align: "center", width: 495 },
        );

        doc.end();

        stream.on("finish", () => {
          resolve(pdfPath);
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate unique voucher number
   */
  generateVoucherNumber(booking) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();

    return `SG${year}${month}${day}${random}`;
  }

  /**
   * Get voucher by booking ID
   */
  async getVoucherByBookingId(bookingId) {
    try {
      const voucher = await this.voucherModel.getByBookingId(bookingId);
      if (voucher.success && voucher.data) {
        return {
          success: true,
          voucher: voucher.data,
          pdf_exists: fs.existsSync(voucher.data.pdf_path),
        };
      }
      return { success: false, error: "Voucher not found" };
    } catch (error) {
      console.error("Error getting voucher:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify voucher by QR code data
   */
  async verifyVoucher(qrData) {
    try {
      if (typeof qrData === "string") {
        qrData = JSON.parse(qrData);
      }

      if (qrData.type !== "sightseeing_voucher") {
        return { success: false, error: "Invalid voucher type" };
      }

      const booking = await this.getBookingDetailsByRef(qrData.booking_ref);
      if (!booking) {
        return { success: false, error: "Booking not found" };
      }

      // Check if voucher is valid for today's date
      const visitDate = new Date(booking.visit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      visitDate.setHours(0, 0, 0, 0);

      const isValidDate = visitDate >= today;

      return {
        success: true,
        booking: {
          booking_ref: booking.booking_ref,
          activity_name: booking.activity_name,
          guest_name: booking.guest_name,
          visit_date: booking.visit_date,
          visit_time: booking.visit_time,
          guest_count: booking.adults_count + booking.children_count,
          status: booking.status,
        },
        valid_for_today: isValidDate,
        verification_time: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error verifying voucher:", error);
      return { success: false, error: "Invalid QR code data" };
    }
  }

  /**
   * Get booking details by booking reference
   */
  async getBookingDetailsByRef(bookingRef) {
    const query = `
      SELECT 
        sb.*,
        si.activity_name,
        si.destination_name
      FROM sightseeing_bookings sb
      LEFT JOIN sightseeing_items si ON sb.activity_code = si.activity_code
      WHERE sb.booking_ref = $1
    `;

    const result = await pool.query(query, [bookingRef]);
    if (result.rows.length === 0) return null;

    const booking = result.rows[0];

    // Parse guest details if it's JSON
    if (typeof booking.guest_details === "string") {
      booking.guest_details = JSON.parse(booking.guest_details);
    }

    // Extract primary guest info
    const primaryGuest = booking.guest_details?.primaryGuest || {};

    return {
      ...booking,
      guest_name:
        `${primaryGuest.firstName || ""} ${primaryGuest.lastName || ""}`.trim(),
    };
  }
}

module.exports = SightseeingVoucherService;
