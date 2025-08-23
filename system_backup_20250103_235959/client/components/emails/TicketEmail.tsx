import React from "react";

interface TicketEmailProps {
  booking: {
    id: string;
    passengers: Array<{
      firstName: string;
      lastName: string;
      type: string;
    }>;
    flights: Array<{
      from: string;
      to: string;
      date: string;
      time: string;
      duration: string;
      airline: string;
      flightNumber: string;
    }>;
    seats: Array<{
      passenger: string;
      seat: string;
      price: number;
    }>;
    total: number;
  };
}

export const TicketEmail: React.FC<TicketEmailProps> = ({ booking }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f8fafc",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#003580",
          color: "white",
          padding: "30px 20px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
          faredown.com
        </h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px", opacity: "0.9" }}>
          Your E-Ticket Confirmation
        </p>
      </div>

      {/* Booking Details */}
      <div
        style={{
          backgroundColor: "white",
          padding: "30px 20px",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#003580", margin: "0 0 10px 0", fontSize: "20px" }}
          >
            Booking Confirmed!
          </h2>
          <p style={{ margin: "0", color: "#666", fontSize: "16px" }}>
            Booking ID: <strong>{booking.id}</strong>
          </p>
        </div>

        {/* Flight Details */}
        {booking.flights.map((flight, index) => (
          <div
            key={index}
            style={{
              marginBottom: "25px",
              padding: "20px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#003580",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {flight.from} → {flight.to}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>Date:</strong> {flight.date}
                </p>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>Time:</strong> {flight.time}
                </p>
              </div>
              <div>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>Flight:</strong> {flight.flightNumber}
                </p>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>Duration:</strong> {flight.duration}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Passenger Details */}
        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#003580",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Passenger Details
          </h3>
          {booking.passengers.map((passenger, index) => (
            <div
              key={index}
              style={{
                padding: "15px",
                backgroundColor: "#f8fafc",
                borderRadius: "6px",
                marginBottom: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                {passenger.firstName} {passenger.lastName}
              </p>
              <p
                style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}
              >
                {passenger.type}
              </p>
            </div>
          ))}
        </div>

        {/* Seat Details */}
        {booking.seats.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#003580",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              Seat Assignments
            </h3>
            {booking.seats.map((seat, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "14px", color: "#333" }}>
                  {seat.passenger} - Seat {seat.seat}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#003580",
                  }}
                >
                  ₹ {seat.price.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total Amount */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#003580",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0", color: "white", fontSize: "16px" }}>
            Total Amount Paid
          </p>
          <p
            style={{
              margin: "10px 0 0 0",
              color: "white",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            ₹ {booking.total.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "30px 20px",
          textAlign: "center",
          borderRadius: "0 0 8px 8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "14px" }}>
          Important: Please arrive at the airport at least 2 hours before
          domestic flights and 3 hours before international flights.
        </p>
        <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
          For any queries, contact us at support@faredown.com or call
          +91-1234567890
        </p>
      </div>
    </div>
  );
};

export default TicketEmail;
