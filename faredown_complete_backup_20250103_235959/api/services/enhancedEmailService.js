/**
 * Enhanced Email Service
 * Supports SendGrid, Postmark, and SMTP with delivery tracking
 */

const nodemailer = require("nodemailer");

class EnhancedEmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || "smtp"; // sendgrid, postmark, smtp
    this.deliveryTracking = new Map(); // Track email delivery status

    this.setupEmailProvider();

    this.companyDetails = {
      name: "Faredown Travel",
      email: process.env.EMAIL_FROM || "noreply@faredown.com",
      phone: "+91-9876543210",
      website: "www.faredown.com",
      address: "Mumbai, Maharashtra, India",
    };
  }

  /**
   * Setup email provider based on configuration
   */
  setupEmailProvider() {
    switch (this.provider) {
      case "sendgrid":
        this.setupSendGrid();
        break;

      case "postmark":
        this.setupPostmark();
        break;

      default:
        this.setupSMTP();
    }
  }

  /**
   * Setup SendGrid
   */
  setupSendGrid() {
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sgMail = sgMail;
        console.log("📧 Email service initialized with SendGrid");
      } catch (error) {
        console.warn("⚠️ SendGrid package not found, falling back to SMTP");
        this.provider = "smtp";
        this.setupSMTP();
      }
    } else {
      console.warn("⚠️ SendGrid API key not found, falling back to SMTP");
      this.provider = "smtp";
      this.setupSMTP();
    }
  }

  /**
   * Setup Postmark
   */
  setupPostmark() {
    if (process.env.POSTMARK_API_KEY) {
      try {
        const postmark = require("postmark");
        this.postmarkClient = new postmark.ServerClient(
          process.env.POSTMARK_API_KEY,
        );
        console.log("📧 Email service initialized with Postmark");
      } catch (error) {
        console.warn("⚠️ Postmark package not found, falling back to SMTP");
        this.provider = "smtp";
        this.setupSMTP();
      }
    } else {
      console.warn("⚠️ Postmark API key not found, falling back to SMTP");
      this.provider = "smtp";
      this.setupSMTP();
    }
  }

  /**
   * Setup SMTP transporter
   */
  setupSMTP() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "support@faredown.com",
        pass: process.env.SMTP_PASS || "app_password_here",
      },
    });
    this.provider = "smtp";
    console.log("📧 Email service initialized with SMTP");
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(emailData) {
    const emailId = this.generateEmailId();

    try {
      let result;

      switch (this.provider) {
        case "sendgrid":
          result = await this.sendWithSendGrid(emailData);
          break;

        case "postmark":
          result = await this.sendWithPostmark(emailData);
          break;

        default:
          result = await this.sendWithSMTP(emailData);
      }

      // Track delivery
      this.deliveryTracking.set(emailId, {
        status: "sent",
        provider: this.provider,
        timestamp: new Date().toISOString(),
        messageId: result.messageId || result.id,
        recipient: emailData.to,
      });

      console.log(
        `📧 Email sent successfully via ${this.provider}: ${emailId}`,
      );
      return {
        success: true,
        emailId,
        messageId: result.messageId || result.id,
      };
    } catch (error) {
      console.error(
        `❌ Email sending failed via ${this.provider}:`,
        error.message,
      );

      this.deliveryTracking.set(emailId, {
        status: "failed",
        provider: this.provider,
        timestamp: new Date().toISOString(),
        error: error.message,
        recipient: emailData.to,
      });

      return { success: false, emailId, error: error.message };
    }
  }

  /**
   * Send with SendGrid
   */
  async sendWithSendGrid(emailData) {
    const msg = {
      to: emailData.to,
      from: emailData.from || this.companyDetails.email,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      attachments: emailData.attachments,
    };

    const response = await this.sgMail.send(msg);
    return { messageId: response[0].headers["x-message-id"] };
  }

  /**
   * Send with Postmark
   */
  async sendWithPostmark(emailData) {
    const message = {
      From: emailData.from || this.companyDetails.email,
      To: emailData.to,
      Subject: emailData.subject,
      TextBody: emailData.text,
      HtmlBody: emailData.html,
      Attachments: emailData.attachments?.map((att) => ({
        Name: att.filename,
        Content: att.content,
        ContentType: att.contentType,
      })),
    };

    const response = await this.postmarkClient.sendEmail(message);
    return { messageId: response.MessageID, id: response.MessageID };
  }

  /**
   * Send with SMTP
   */
  async sendWithSMTP(emailData) {
    const mailOptions = {
      from: emailData.from || this.companyDetails.email,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      attachments: emailData.attachments,
    };

    const info = await this.transporter.sendMail(mailOptions);
    return { messageId: info.messageId };
  }

  /**
   * Send voucher email with PDF attachment
   */
  async sendVoucherEmail(bookingData, voucherPdfBuffer) {
    const emailData = {
      to: bookingData.guestDetails.primaryGuest.email,
      subject: `🎉 Your Hotel Booking Confirmation - ${bookingData.bookingRef}`,
      html: this.generateVoucherEmailHTML(bookingData),
      text: this.generateVoucherEmailText(bookingData),
      attachments: [
        {
          filename: `voucher_${bookingData.bookingRef}.pdf`,
          content: voucherPdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingData) {
    const emailData = {
      to: bookingData.guestDetails.primaryGuest.email,
      subject: `✅ Booking Confirmed - ${bookingData.bookingRef}`,
      html: this.generateConfirmationEmailHTML(bookingData),
      text: this.generateConfirmationEmailText(bookingData),
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Generate voucher email HTML
   */
  generateVoucherEmailHTML(bookingData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hotel Booking Voucher</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Hotel Booking is Confirmed!</h1>
          <p>Booking Reference: <strong>${bookingData.bookingRef}</strong></p>
        </div>
        
        <div class="content">
          <div class="booking-details">
            <h3>📍 Hotel Details</h3>
            <p><strong>Hotel:</strong> ${bookingData.hotelDetails.name}</p>
            <p><strong>Address:</strong> ${bookingData.hotelDetails.address}</p>
            <p><strong>Check-in:</strong> ${bookingData.checkIn}</p>
            <p><strong>Check-out:</strong> ${bookingData.checkOut}</p>
          </div>
          
          <div class="booking-details">
            <h3>👤 Guest Details</h3>
            <p><strong>Primary Guest:</strong> ${bookingData.guestDetails.primaryGuest.firstName} ${bookingData.guestDetails.primaryGuest.lastName}</p>
            <p><strong>Email:</strong> ${bookingData.guestDetails.primaryGuest.email}</p>
            <p><strong>Phone:</strong> ${bookingData.guestDetails.contactInfo.phone}</p>
          </div>
          
          <div class="booking-details">
            <h3>💰 Payment Summary</h3>
            <p><strong>Total Amount:</strong> ���${bookingData.totalAmount}</p>
            <p><strong>Payment Status:</strong> Confirmed</p>
          </div>
          
          <p><strong>📎 Your detailed voucher is attached as a PDF.</strong></p>
          <p>Please present this voucher at the hotel during check-in.</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing ${this.companyDetails.name}!</p>
          <p>Contact us: ${this.companyDetails.email} | ${this.companyDetails.phone}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate voucher email text
   */
  generateVoucherEmailText(bookingData) {
    return `
🎉 Your Hotel Booking is Confirmed!

Booking Reference: ${bookingData.bookingRef}

📍 Hotel Details:
Hotel: ${bookingData.hotelDetails.name}
Address: ${bookingData.hotelDetails.address}
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut}

👤 Guest Details:
Primary Guest: ${bookingData.guestDetails.primaryGuest.firstName} ${bookingData.guestDetails.primaryGuest.lastName}
Email: ${bookingData.guestDetails.primaryGuest.email}
Phone: ${bookingData.guestDetails.contactInfo.phone}

💰 Payment Summary:
Total Amount: ₹${bookingData.totalAmount}
Payment Status: Confirmed

📎 Your detailed voucher is attached as a PDF.
Please present this voucher at the hotel during check-in.

Thank you for choosing ${this.companyDetails.name}!
Contact us: ${this.companyDetails.email} | ${this.companyDetails.phone}
    `;
  }

  /**
   * Generate confirmation email HTML
   */
  generateConfirmationEmailHTML(bookingData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed</h1>
          <p>Reference: ${bookingData.bookingRef}</p>
        </div>
        
        <div class="content">
          <p>Dear ${bookingData.guestDetails.primaryGuest.firstName},</p>
          <p>Your hotel booking has been confirmed! Your voucher will be sent separately.</p>
          
          <div class="booking-details">
            <h3>Quick Summary</h3>
            <p><strong>Hotel:</strong> ${bookingData.hotelDetails.name}</p>
            <p><strong>Dates:</strong> ${bookingData.checkIn} to ${bookingData.checkOut}</p>
            <p><strong>Amount:</strong> ₹${bookingData.totalAmount}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate confirmation email text
   */
  generateConfirmationEmailText(bookingData) {
    return `
✅ Booking Confirmed

Reference: ${bookingData.bookingRef}

Dear ${bookingData.guestDetails.primaryGuest.firstName},

Your hotel booking has been confirmed! Your voucher will be sent separately.

Quick Summary:
Hotel: ${bookingData.hotelDetails.name}
Dates: ${bookingData.checkIn} to ${bookingData.checkOut}
Amount: ₹${bookingData.totalAmount}

Thank you for choosing ${this.companyDetails.name}!
    `;
  }

  /**
   * Generate unique email ID
   */
  generateEmailId() {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get delivery status
   */
  getDeliveryStatus(emailId) {
    return this.deliveryTracking.get(emailId) || null;
  }

  /**
   * Get all delivery tracking data
   */
  getAllDeliveryData() {
    return Array.from(this.deliveryTracking.entries()).map(([id, data]) => ({
      emailId: id,
      ...data,
    }));
  }
}

module.exports = EnhancedEmailService;
