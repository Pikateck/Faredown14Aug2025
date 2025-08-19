// Code export functionality for downloading project information

export interface ProjectInfo {
  name: string;
  description: string;
  version: string;
  structure: string[];
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export const generateProjectExport = (): string => {
  const projectInfo: ProjectInfo = {
    name: "Faredown Travel Booking Platform",
    description:
      "A comprehensive travel booking platform with bargaining features",
    version: "1.0.0",
    structure: [
      "client/",
      "├── components/",
      "│   ├── ui/ (Radix UI components)",
      "│   ├── Header.tsx",
      "│   ├── MobileTicket.tsx",
      "│   └── ...",
      "├── pages/",
      "│   ├── Index.tsx (Landing page)",
      "│   ├── HotelDetails.tsx",
      "│   ├── ReservationPage.tsx",
      "│   ├── BookingConfirmation.tsx",
      "│   ├── Account.tsx",
      "│   └── ...",
      "├── contexts/",
      "│   └── CurrencyContext.tsx",
      "├── lib/",
      "│   ├── utils.ts",
      "│   ├── pricing.ts",
      "│   ├── downloadUtils.ts",
      "│   └── codeExport.ts",
      "└── App.tsx",
    ],
    dependencies: {
      react: "^18.3.1",
      "react-router-dom": "^6.26.2",
      tailwindcss: "^3.4.11",
      "lucide-react": "^0.462.0",
      "@radix-ui/react-*": "Various UI components",
      typescript: "^5.5.3",
      vite: "^6.2.2",
    },
    scripts: {
      dev: "vite (Start development server)",
      build: "npm run build:client && npm run build:server",
      "build:client": "vite build (Build client)",
      "build:server": "vite build --config vite.config.server.ts",
    },
  };

  return `# Faredown Travel Booking Platform

## Project Overview
${projectInfo.description}

## Features
- 🎯 Live Bargaining Technology
- 🏨 Hotel Booking System
- ✈️ Flight Search & Booking
- 💳 Secure Payment Processing
- 📱 Mobile-Responsive Design
- 🎨 Modern UI with Tailwind CSS
- 🔐 User Account Management
- 📄 PDF Generation & Downloads
- 🌍 Multi-Currency Support

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State Management**: React Context API
- **Build Tool**: Vite
- **Deployment**: Express.js server

## Project Structure
\`\`\`
${projectInfo.structure.join("\n")}
\`\`\`

## Key Dependencies
${Object.entries(projectInfo.dependencies)
  .map(([name, version]) => `- **${name}**: ${version}`)
  .join("\n")}

## Available Scripts
${Object.entries(projectInfo.scripts)
  .map(([script, description]) => `- \`npm run ${script}\`: ${description}`)
  .join("\n")}

## Getting Started

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Build for Production**
   \`\`\`bash
   npm run build
   \`\`\`

## Key Features Implementation

### Bargaining System
- Real-time price negotiation
- AI-powered counter offers
- Timer-based offer expiration
- Multiple bargaining rounds

### Booking Flow
- Hotel search and filtering
- Room selection with amenities
- Guest information collection
- Secure payment processing
- Confirmation with downloads

### User Experience
- Responsive design for all devices
- Progressive web app features
- Smooth animations and transitions
- Accessibility compliance

### Payment Integration
- Multiple payment methods
- Secure payment processing
- Invoice and voucher generation
- Booking confirmation emails

## File Generation Information
Generated on: ${new Date().toLocaleString()}
Export Type: Project Overview & Structure
Version: ${projectInfo.version}

---
Built with ❤️ using React + TypeScript + Tailwind CSS
`;
};

export const downloadProjectInfo = (): void => {
  try {
    const content = generateProjectExport();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `faredown-project-info-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download project info:", error);
    alert("Failed to download project information. Please try again.");
  }
};

export const generateComponentsList = (): string => {
  const components = [
    "Header.tsx - Main navigation header",
    "MobileTicket.tsx - Mobile ticket display",
    "EnhancedBargainModal.tsx - Bargaining interface",
    "ComprehensiveFilters.tsx - Search filters",
    "HotelCard.tsx - Hotel listing card",
    "MobileDropdowns.tsx - Mobile UI components",

    // Pages
    "Index.tsx - Landing page with search",
    "HotelDetails.tsx - Hotel information & booking",
    "HotelResults.tsx - Hotel search results",
    "ReservationPage.tsx - Booking form & payment",
    "BookingConfirmation.tsx - Booking success page",
    "Account.tsx - User account management",
    "BookingVoucher.tsx - Downloadable voucher",
    "BookingInvoice.tsx - Downloadable invoice",

    // Utilities
    "utils.ts - Common utilities",
    "pricing.ts - Price calculations",
    "downloadUtils.ts - File download helpers",
    "CurrencyContext.tsx - Currency management",
  ];

  return `# Component Documentation

## Core Components
${components.map((comp) => `- ${comp}`).join("\n")}

## Component Architecture
- **Atomic Design**: Small, reusable components
- **Context API**: Global state management
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible primitives

Generated: ${new Date().toLocaleString()}
`;
};
