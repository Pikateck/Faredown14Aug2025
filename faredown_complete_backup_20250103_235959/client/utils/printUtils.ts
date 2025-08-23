// Print utility functions for Faredown vouchers and invoices

export const printDocument = (elementId?: string) => {
  // Add print-specific styles if not already present
  if (!document.getElementById("faredown-print-styles")) {
    const printStyles = document.createElement("style");
    printStyles.id = "faredown-print-styles";
    printStyles.textContent = `
      @media print {
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 100%; 
        }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(printStyles);
  }

  // If specific element ID is provided, focus print on that element
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("print-area");
    }
  }

  // Trigger print
  window.print();

  // Clean up after print
  setTimeout(() => {
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.remove("print-area");
      }
    }
  }, 1000);
};

export const downloadAsPDF = async (elementId: string, filename: string) => {
  try {
    // For now, use browser's print to PDF functionality
    // In a real implementation, you might use libraries like jsPDF or Puppeteer
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // Add print styles temporarily
    element.classList.add("print-area");

    // Show instructions to user for PDF download
    alert(`To download as PDF:
1. Press Ctrl+P (or Cmd+P on Mac)
2. Choose "Save as PDF" as the destination
3. Click "Save" and choose your filename: ${filename}`);

    // Trigger print dialog
    window.print();

    // Clean up
    setTimeout(() => {
      element.classList.remove("print-area");
    }, 1000);
  } catch (error) {
    console.error("PDF download failed:", error);
    alert("PDF download failed. Please try using the print function.");
  }
};

export const emailDocument = (
  documentType: "voucher" | "invoice",
  bookingRef: string,
) => {
  // This would integrate with your email service
  // For now, we'll show a placeholder
  const subject = `Your Faredown ${documentType} - ${bookingRef}`;
  const body = `Please find your ${documentType} attached for booking reference ${bookingRef}.

Thank you for choosing Faredown!

Best regards,
Faredown Support Team
support@faredown.com
+971 4 123 4567`;

  // For demonstration, open default email client
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);

  // In a real implementation, you would:
  // 1. Generate PDF of the document
  // 2. Send it via your email service (SendGrid, AWS SES, etc.)
  // 3. Show success/failure notification

  console.log(`Email ${documentType} for booking ${bookingRef}`);
};

export const shareDocument = async (
  documentType: "voucher" | "invoice",
  bookingRef: string,
) => {
  const shareData = {
    title: `Faredown ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`,
    text: `My ${documentType} for booking ${bookingRef}`,
    url: window.location.href,
  };

  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      console.log("Document shared successfully");
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  } catch (error) {
    console.error("Sharing failed:", error);
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (clipboardError) {
      console.error("Clipboard copy failed:", clipboardError);
      alert("Sharing failed. You can manually copy the page URL to share.");
    }
  }
};

// Utility to prepare document for printing
export const preparePrintDocument = (documentType: "voucher" | "invoice") => {
  // Set page title for print
  const originalTitle = document.title;
  document.title = `Faredown ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`;

  // Listen for after print to restore title
  const afterPrint = () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", afterPrint);
  };

  window.addEventListener("afterprint", afterPrint);

  return () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", afterPrint);
  };
};

// Format booking data for print-friendly display
export const formatBookingForPrint = (booking: any) => {
  return {
    ...booking,
    formattedDate: booking.date || booking.visitDate || booking.checkIn,
    formattedTime: booking.time || booking.visitTime || "12:00",
    formattedAmount: booking.totalAmount || "₹0",
    formattedGuests: booking.passengers || booking.guests || 1,
    serviceName:
      booking.type === "flight"
        ? `${booking.airline} ${booking.flightNumber}`
        : booking.type === "hotel"
          ? booking.name
          : booking.name || "Experience",
    serviceDetails:
      booking.type === "flight"
        ? `${booking.route} • ${booking.date} ${booking.time}`
        : booking.type === "hotel"
          ? `${booking.location} • ${booking.checkIn} to ${booking.checkOut}`
          : `${booking.location} • ${booking.visitDate || booking.date}`,
  };
};
