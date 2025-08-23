// Email service for sending booking confirmations
// In a real implementation, this would integrate with EmailJS, SendGrid, or your backend email service

export const sendBookingConfirmation = async (bookingData) => {
  try {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real implementation, you would:
    // 1. Call your backend API to send email
    // 2. Use EmailJS for client-side email sending
    // 3. Integrate with SendGrid, Mailgun, or similar service

    const emailTemplate = generateEmailTemplate(bookingData);

    // Example with EmailJS (you would need to set up EmailJS account):
    // await emailjs.send(
    //   'your_service_id',
    //   'your_template_id',
    //   {
    //     to_email: bookingData.bookingDetails.contactDetails.email,
    //     subject: `Flight Booking Confirmation - ${bookingData.bookingDetails.bookingRef}`,
    //     html_content: emailTemplate
    //   }
    // );

    console.log(
      "Email sent successfully to:",
      bookingData.bookingDetails.contactDetails.email,
    );
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

const generateEmailTemplate = (bookingData) => {
  const { bookingDetails } = bookingData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Flight Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .flight-details { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .important-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .ticket-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <h2>faredown.com</h2>
          <p>Your Travel Partner</p>
        </div>
        
        <div class="content">
          <h2>Hello ${bookingDetails.passengers[0]?.firstName}!</h2>
          
          <p>Thank you for choosing Faredown. Your flight booking has been confirmed!</p>
          
          <div class="ticket-info">
            <h3>📋 Booking Details</h3>
            <p><strong>Booking Reference:</strong> ${bookingDetails.bookingRef}</p>
            <p><strong>Payment ID:</strong> ${bookingData.paymentId}</p>
            <p><strong>Total Paid:</strong> ${bookingDetails.currency.symbol}${bookingDetails.totalAmount.toLocaleString()}</p>
          </div>
          
          <div class="flight-details">
            <h3>✈️ Flight Information</h3>
            
            <div style="margin-bottom: 20px;">
              <h4>Outbound: Mumbai → Dubai</h4>
              <p><strong>Date:</strong> Saturday, August 3, 2024</p>
              <p><strong>Flight:</strong> Emirates EK 508</p>
              <p><strong>Departure:</strong> 10:15 AM from Mumbai (BOM)</p>
              <p><strong>Arrival:</strong> 1:45 PM in Dubai (DXB)</p>
              <p><strong>Duration:</strong> 3h 30m (Direct)</p>
              ${bookingDetails.selectedSeats?.outbound ? `<p><strong>Seat:</strong> ${bookingDetails.selectedSeats.outbound}</p>` : ""}
            </div>
            
            <div>
              <h4>Return: Dubai → Mumbai</h4>
              <p><strong>Date:</strong> Saturday, August 10, 2024</p>
              <p><strong>Flight:</strong> Emirates EK 509</p>
              <p><strong>Departure:</strong> 3:20 PM from Dubai (DXB)</p>
              <p><strong>Arrival:</strong> 8:00 PM in Mumbai (BOM)</p>
              <p><strong>Duration:</strong> 4h 40m (Direct)</p>
              ${bookingDetails.selectedSeats?.return ? `<p><strong>Seat:</strong> ${bookingDetails.selectedSeats.return}</p>` : ""}
            </div>
          </div>
          
          <div class="important-box">
            <h3>⚠️ Important Reminders</h3>
            <ul>
              <li>Online check-in opens 24 hours before departure</li>
              <li>Arrive at airport 3 hours before international flights</li>
              <li>Carry valid passport and visa documents</li>
              <li>Keep this email for airport reference</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/account" class="button">View My Bookings</a>
          </div>
          
          <h3>👥 Passenger Information</h3>
          ${bookingDetails.passengers
            .map(
              (passenger, index) => `
            <div class="ticket-info">
              <p><strong>Adult ${index + 1}:</strong> ${passenger.firstName} ${passenger.lastName}</p>
              ${passenger.passportNumber ? `<p><strong>Passport:</strong> ${passenger.passportNumber}</p>` : ""}
            </div>
          `,
            )
            .join("")}
          
          <h3>📞 Need Help?</h3>
          <p>Our customer support team is here to help:</p>
          <ul>
            <li>📧 Email: support@faredown.com</li>
            <li>📱 Phone: +91-1234567890</li>
            <li>💬 Live Chat: Available 24/7 on our website</li>
          </ul>
          
          <p>Safe travels!</p>
          <p><strong>Team Faredown</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 Faredown. All rights reserved.</p>
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated confirmation email. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateTicketPDF = (bookingData) => {
  // In a real implementation, you would use libraries like:
  // - jsPDF
  // - PDFKit
  // - Puppeteer (server-side)
  // - React-PDF

  console.log(
    "Generating PDF ticket for booking:",
    bookingData.bookingDetails.bookingRef,
  );

  // For now, we'll simulate PDF generation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        pdfUrl: `${window.location.origin}/api/tickets/${bookingData.bookingDetails.bookingRef}.pdf`,
        message: "PDF generated successfully",
      });
    }, 1000);
  });
};
