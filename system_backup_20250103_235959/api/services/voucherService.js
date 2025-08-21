/**
 * Voucher and Invoice Generation Service
 * Handles PDF generation for hotel booking vouchers and GST invoices
 */

const PDFDocument = require("pdfkit");

class VoucherService {
  constructor() {
    // Company details
    this.companyDetails = {
      name: "Faredown Travel Private Limited",
      address: "Mumbai, Maharashtra, India",
      phone: "+91-9876543210",
      email: "support@faredown.com",
      website: "www.faredown.com",
      gstin: "27AABCF1234A1Z5",
      pan: "AABCF1234A",
    };
  }

  /**
   * Generate hotel booking voucher PDF
   */
  async generateHotelVoucher(bookingData) {
    try {
      const {
        bookingRef,
        hotelDetails,
        guestDetails,
        roomDetails,
        checkIn,
        checkOut,
        totalAmount,
        currency,
        paymentDetails,
        specialRequests,
      } = bookingData;

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (buffer) => buffers.push(buffer));

      // Add header
      this.addVoucherHeader(doc);

      // Add booking information
      this.addBookingInfo(doc, {
        bookingRef,
        bookingDate: new Date().toLocaleDateString("en-IN"),
        status: "Confirmed",
      });

      // Add hotel details
      this.addHotelDetails(doc, hotelDetails);

      // Add guest details
      this.addGuestDetails(doc, guestDetails);

      // Add room and stay details
      this.addStayDetails(doc, {
        roomDetails,
        checkIn,
        checkOut,
        nights: this.calculateNights(checkIn, checkOut),
      });

      // Add special requests if any
      if (specialRequests) {
        this.addSpecialRequests(doc, specialRequests);
      }

      // Add important notes
      this.addImportantNotes(doc);

      // Add footer
      this.addVoucherFooter(doc);

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({
            success: true,
            pdf: pdfBuffer,
            filename: `voucher_${bookingRef}.pdf`,
          });
        });

        doc.on("error", reject);
      });
    } catch (error) {
      console.error("Voucher generation error:", error);
      throw new Error(`Failed to generate voucher: ${error.message}`);
    }
  }

  /**
   * Generate GST invoice PDF
   */
  async generateGSTInvoice(bookingData) {
    try {
      const {
        bookingRef,
        hotelDetails,
        guestDetails,
        roomDetails,
        checkIn,
        checkOut,
        totalAmount,
        currency,
        paymentDetails,
        markupDetails,
        taxDetails,
      } = bookingData;

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (buffer) => buffers.push(buffer));

      // Add invoice header
      this.addInvoiceHeader(doc);

      // Add company and customer details
      this.addInvoiceParties(doc, guestDetails);

      // Add invoice details
      this.addInvoiceDetails(doc, {
        invoiceNumber: `INV-${bookingRef}`,
        invoiceDate: new Date().toLocaleDateString("en-IN"),
        bookingRef,
      });

      // Add itemized billing
      this.addItemizedBilling(doc, {
        hotelDetails,
        roomDetails,
        checkIn,
        checkOut,
        totalAmount,
        markupDetails,
        taxDetails,
      });

      // Add tax summary
      this.addTaxSummary(doc, taxDetails);

      // Add payment details
      this.addPaymentDetails(doc, paymentDetails);

      // Add terms and conditions
      this.addTermsAndConditions(doc);

      // Add invoice footer
      this.addInvoiceFooter(doc);

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({
            success: true,
            pdf: pdfBuffer,
            filename: `invoice_${bookingRef}.pdf`,
          });
        });

        doc.on("error", reject);
      });
    } catch (error) {
      console.error("Invoice generation error:", error);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }

  /**
   * Add voucher header
   */
  addVoucherHeader(doc) {
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#2563eb")
      .text("HOTEL BOOKING VOUCHER", 50, 50);

    // Add company logo area
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#000000")
      .text(this.companyDetails.name, 400, 55)
      .text(this.companyDetails.phone, 400, 70)
      .text(this.companyDetails.email, 400, 85);

    // Add line separator
    doc.moveTo(50, 110).lineTo(550, 110).strokeColor("#e5e7eb").stroke();
  }

  /**
   * Add booking information
   */
  addBookingInfo(doc, bookingInfo) {
    const startY = 130;

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Booking Information", 50, startY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Booking Reference: ${bookingInfo.bookingRef}`, 50, startY + 25)
      .text(`Booking Date: ${bookingInfo.bookingDate}`, 50, startY + 40)
      .text(`Status: ${bookingInfo.status}`, 50, startY + 55);

    // Add confirmation badge
    doc
      .rect(400, startY + 20, 100, 25)
      .fillAndStroke("#22c55e", "#16a34a")
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .text("CONFIRMED", 420, startY + 28)
      .fillColor("#000000");
  }

  /**
   * Add hotel details
   */
  addHotelDetails(doc, hotelDetails) {
    const startY = 220;

    doc.fontSize(14).font("Helvetica-Bold").text("Hotel Details", 50, startY);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(hotelDetails.name || "Hotel Name", 50, startY + 25);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(hotelDetails.address || "Hotel Address", 50, startY + 45)
      .text(`Phone: ${hotelDetails.phone || "N/A"}`, 50, startY + 60)
      .text(`Email: ${hotelDetails.email || "N/A"}`, 50, startY + 75);

    // Add star rating if available
    if (hotelDetails.starRating) {
      let stars = "";
      for (let i = 0; i < hotelDetails.starRating; i++) {
        stars += "★";
      }
      doc
        .fontSize(12)
        .fillColor("#fbbf24")
        .text(stars, 400, startY + 25)
        .fillColor("#000000");
    }
  }

  /**
   * Add guest details
   */
  addGuestDetails(doc, guestDetails) {
    const startY = 330;

    doc.fontSize(14).font("Helvetica-Bold").text("Guest Details", 50, startY);

    const primaryGuest = guestDetails.primaryGuest || {};

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Primary Guest: ${primaryGuest.title || ""} ${primaryGuest.firstName || ""} ${primaryGuest.lastName || ""}`,
        50,
        startY + 25,
      )
      .text(
        `Email: ${guestDetails.contactInfo?.email || "N/A"}`,
        50,
        startY + 40,
      )
      .text(
        `Phone: ${guestDetails.contactInfo?.phone || "N/A"}`,
        50,
        startY + 55,
      );

    // Add additional guests if any
    if (
      guestDetails.additionalGuests &&
      guestDetails.additionalGuests.length > 0
    ) {
      doc.text("Additional Guests:", 300, startY + 25);
      guestDetails.additionalGuests.forEach((guest, index) => {
        doc.text(
          `${index + 1}. ${guest.firstName} ${guest.lastName}`,
          300,
          startY + 40 + index * 15,
        );
      });
    }
  }

  /**
   * Add stay details
   */
  addStayDetails(doc, stayDetails) {
    const startY = 430;

    doc.fontSize(14).font("Helvetica-Bold").text("Stay Details", 50, startY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Check-in Date: ${new Date(stayDetails.checkIn).toLocaleDateString("en-IN")}`,
        50,
        startY + 25,
      )
      .text(
        `Check-out Date: ${new Date(stayDetails.checkOut).toLocaleDateString("en-IN")}`,
        50,
        startY + 40,
      )
      .text(`Number of Nights: ${stayDetails.nights}`, 50, startY + 55);

    // Room details
    const room = stayDetails.roomDetails || {};
    doc
      .text(`Room Type: ${room.name || "Standard Room"}`, 300, startY + 25)
      .text(`Room Category: ${room.category || "N/A"}`, 300, startY + 40)
      .text(`Bed Type: ${room.bedType || "N/A"}`, 300, startY + 55);
  }

  /**
   * Add special requests
   */
  addSpecialRequests(doc, specialRequests) {
    const startY = 530;

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Special Requests", 50, startY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(specialRequests, 50, startY + 20, { width: 500 });
  }

  /**
   * Add important notes
   */
  addImportantNotes(doc) {
    const startY = 600;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#dc2626")
      .text("Important Notes:", 50, startY);

    const notes = [
      "• Please carry a valid photo ID proof for check-in",
      "• Check-in time is usually 3:00 PM and check-out time is 11:00 AM",
      "• Present this voucher at the hotel reception during check-in",
      "• Contact Faredown support for any booking modifications or cancellations",
      "• Hotel amenities and services are subject to availability",
    ];

    doc.fontSize(9).font("Helvetica").fillColor("#000000");

    notes.forEach((note, index) => {
      doc.text(note, 50, startY + 25 + index * 15);
    });
  }

  /**
   * Add voucher footer
   */
  addVoucherFooter(doc) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 80;

    // Add separator line
    doc
      .moveTo(50, footerY - 20)
      .lineTo(550, footerY - 20)
      .strokeColor("#e5e7eb")
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text(
        "This is a computer generated voucher and does not require a signature.",
        50,
        footerY,
      )
      .text(
        `Generated on: ${new Date().toLocaleString("en-IN")}`,
        50,
        footerY + 12,
      )
      .text(
        "For support, contact: support@faredown.com | +91-9876543210",
        50,
        footerY + 24,
      );

    doc.text("Faredown Travel - Your Journey, Our Passion", 350, footerY + 12);
  }

  /**
   * Add invoice header
   */
  addInvoiceHeader(doc) {
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("TAX INVOICE", 50, 50);

    // Add company details
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000000")
      .text(this.companyDetails.name, 350, 55)
      .text(this.companyDetails.address, 350, 70)
      .text(`GSTIN: ${this.companyDetails.gstin}`, 350, 85)
      .text(`PAN: ${this.companyDetails.pan}`, 350, 100);

    // Add line separator
    doc.moveTo(50, 120).lineTo(550, 120).strokeColor("#e5e7eb").stroke();
  }

  /**
   * Add invoice parties (company and customer)
   */
  addInvoiceParties(doc, guestDetails) {
    const startY = 140;

    // Seller details
    doc.fontSize(12).font("Helvetica-Bold").text("Seller Details:", 50, startY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(this.companyDetails.name, 50, startY + 20)
      .text(this.companyDetails.address, 50, startY + 35)
      .text(`Phone: ${this.companyDetails.phone}`, 50, startY + 50)
      .text(`Email: ${this.companyDetails.email}`, 50, startY + 65);

    // Buyer details
    doc.fontSize(12).font("Helvetica-Bold").text("Buyer Details:", 300, startY);

    const primaryGuest = guestDetails.primaryGuest || {};
    const contactInfo = guestDetails.contactInfo || {};

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `${primaryGuest.title || ""} ${primaryGuest.firstName || ""} ${primaryGuest.lastName || ""}`,
        300,
        startY + 20,
      )
      .text(`Email: ${contactInfo.email || "N/A"}`, 300, startY + 35)
      .text(`Phone: ${contactInfo.phone || "N/A"}`, 300, startY + 50);
  }

  /**
   * Calculate number of nights between check-in and check-out
   */
  calculateNights(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate - checkInDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Add itemized billing (simplified version)
   */
  addItemizedBilling(doc, billingDetails) {
    const startY = 260;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Itemized Billing", 50, startY);

    // Add simplified billing table
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Hotel Booking", 50, startY + 30)
      .text(`₹${billingDetails.totalAmount || 0}`, 450, startY + 30);
  }

  /**
   * Add other invoice sections (simplified implementations)
   */
  addInvoiceDetails(doc, invoiceDetails) {
    // Simplified implementation
    doc.fontSize(10).text(`Invoice: ${invoiceDetails.invoiceNumber}`, 50, 240);
  }

  addTaxSummary(doc, taxDetails) {
    // Simplified implementation
    doc.fontSize(10).text("Tax Summary: GST Applicable", 50, 400);
  }

  addPaymentDetails(doc, paymentDetails) {
    // Simplified implementation
    doc.fontSize(10).text("Payment: Online Payment Received", 50, 450);
  }

  addTermsAndConditions(doc) {
    // Simplified implementation
    doc.fontSize(8).text("Terms & Conditions apply", 50, 500);
  }

  addInvoiceFooter(doc) {
    // Simplified implementation
    doc.fontSize(8).text("Thank you for choosing Faredown!", 50, 600);
  }
}

module.exports = new VoucherService();
