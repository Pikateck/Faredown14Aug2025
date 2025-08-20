import React from "react";

interface OTPEmailProps {
  otp: string;
  userName?: string;
  purpose: "login" | "registration" | "password-reset";
}

export const OTPEmail: React.FC<OTPEmailProps> = ({
  otp,
  userName,
  purpose,
}) => {
  const getTitle = () => {
    switch (purpose) {
      case "login":
        return "Login Verification Code";
      case "registration":
        return "Welcome to Faredown - Verify Your Account";
      case "password-reset":
        return "Password Reset Verification";
      default:
        return "Verification Code";
    }
  };

  const getMessage = () => {
    switch (purpose) {
      case "login":
        return "Please use the following OTP to complete your login:";
      case "registration":
        return "Thank you for joining Faredown! Please verify your email address with this OTP:";
      case "password-reset":
        return "You requested a password reset. Use this OTP to proceed:";
      default:
        return "Your verification code:";
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "500px",
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
        <h1 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
          faredown.com
        </h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "14px", opacity: "0.9" }}>
          {getTitle()}
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "white",
          padding: "30px 20px",
          border: "1px solid #e2e8f0",
        }}
      >
        {userName && (
          <p style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#333" }}>
            Hello {userName},
          </p>
        )}

        <p style={{ margin: "0 0 25px 0", fontSize: "16px", color: "#666" }}>
          {getMessage()}
        </p>

        {/* OTP Display */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "2px dashed #003580",
            borderRadius: "8px",
            padding: "25px",
            textAlign: "center",
            margin: "20px 0",
          }}
        >
          <p
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              color: "#666",
              textTransform: "uppercase",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            Your OTP Code
          </p>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#003580",
              fontFamily: "monospace",
              letterSpacing: "8px",
              margin: "0",
            }}
          >
            {otp}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fef3cd",
            border: "1px solid #fbbf24",
            borderRadius: "6px",
            padding: "15px",
            margin: "20px 0",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: "#92400e",
              fontWeight: "bold",
            }}
          >
            ⚠️ Important Security Information:
          </p>
          <ul
            style={{
              margin: "10px 0 0 0",
              padding: "0 0 0 20px",
              color: "#92400e",
            }}
          >
            <li style={{ fontSize: "14px", margin: "5px 0" }}>
              This OTP is valid for 10 minutes only
            </li>
            <li style={{ fontSize: "14px", margin: "5px 0" }}>
              Never share this code with anyone
            </li>
            <li style={{ fontSize: "14px", margin: "5px 0" }}>
              Faredown will never ask for your OTP via phone or email
            </li>
          </ul>
        </div>

        {purpose === "registration" && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #22c55e",
              borderRadius: "6px",
              padding: "15px",
              margin: "20px 0",
            }}
          >
            <p style={{ margin: "0", fontSize: "14px", color: "#15803d" }}>
              🎉 <strong>Welcome to Faredown!</strong> After verification,
              you'll have access to:
            </p>
            <ul
              style={{
                margin: "10px 0 0 0",
                padding: "0 0 0 20px",
                color: "#15803d",
              }}
            >
              <li style={{ fontSize: "14px", margin: "3px 0" }}>
                Exclusive member deals
              </li>
              <li style={{ fontSize: "14px", margin: "3px 0" }}>
                Faster booking process
              </li>
              <li style={{ fontSize: "14px", margin: "3px 0" }}>
                Trip management dashboard
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "20px",
          textAlign: "center",
          borderRadius: "0 0 8px 8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "14px" }}>
          If you didn't request this{" "}
          {purpose === "login"
            ? "login"
            : purpose === "registration"
              ? "account"
              : "password reset"}
          , please ignore this email.
        </p>
        <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
          Need help? Contact us at support@faredown.com
        </p>
      </div>
    </div>
  );
};

export default OTPEmail;
