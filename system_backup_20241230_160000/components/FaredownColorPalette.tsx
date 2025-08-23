import React from "react";
import { Copy, Check, Palette, Code, Monitor, Smartphone } from "lucide-react";

const FaredownColorPalette = () => {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const ColorCard = ({
    name,
    color,
    usage,
    textColor = "text-white",
    category,
  }: {
    name: string;
    color: string;
    usage: string;
    textColor?: string;
    category: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div
        className={`h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 relative group`}
        style={{ backgroundColor: color }}
        onClick={() => copyToClipboard(color)}
      >
        <div
          className={`${textColor} font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          Click to copy
        </div>
        {copiedColor === color && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Check className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
          <button
            onClick={() => copyToClipboard(color)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-600 mb-2">{usage}</p>
        <div className="flex items-center justify-between">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {color}
          </code>
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            {category}
          </span>
        </div>
      </div>
    </div>
  );

  const brandColors = [
    {
      name: "Primary Blue",
      color: "#003580",
      usage: "Headers, primary buttons, main branding",
      category: "Brand",
    },
    {
      name: "Secondary Blue",
      color: "#0071c2",
      usage: "Hover states, secondary actions",
      category: "Brand",
    },
    {
      name: "Primary Yellow",
      color: "#febb02",
      usage: "CTA buttons, highlights, accent elements",
      category: "Brand",
      textColor: "text-black",
    },
    {
      name: "Yellow Hover",
      color: "#e6a602",
      usage: "Button hover states",
      category: "Brand",
      textColor: "text-black",
    },
  ];

  const supportingColors = [
    {
      name: "Accent Blue",
      color: "#e7f0fa",
      usage: "Light backgrounds, cards",
      category: "Supporting",
      textColor: "text-gray-800",
    },
    {
      name: "Text Gray",
      color: "#6b6b6b",
      usage: "Secondary text, descriptions",
      category: "Supporting",
      textColor: "text-white",
    },
    {
      name: "Light Gray",
      color: "#f2f2f2",
      usage: "Backgrounds, separators",
      category: "Supporting",
      textColor: "text-gray-800",
    },
    {
      name: "Border Gray",
      color: "#d1d5db",
      usage: "Borders, dividers",
      category: "Supporting",
      textColor: "text-gray-800",
    },
  ];

  const systemColors = [
    {
      name: "Success Green",
      color: "#16a34a",
      usage: "Success messages, confirmations",
      category: "System",
    },
    {
      name: "Error Red",
      color: "#dc2626",
      usage: "Error messages, warnings",
      category: "System",
    },
    {
      name: "Info Blue",
      color: "#3b82f6",
      usage: "Information, system messages",
      category: "System",
    },
    {
      name: "Warning Orange",
      color: "#f59e0b",
      usage: "Warnings, alerts",
      category: "System",
      textColor: "text-black",
    },
  ];

  const neutralColors = [
    {
      name: "White",
      color: "#ffffff",
      usage: "Backgrounds, text on dark",
      category: "Neutral",
      textColor: "text-gray-800",
    },
    {
      name: "Black",
      color: "#000000",
      usage: "Text, dark backgrounds",
      category: "Neutral",
    },
    {
      name: "Dark Gray",
      color: "#374151",
      usage: "Primary text, headings",
      category: "Neutral",
    },
    {
      name: "Medium Gray",
      color: "#9ca3af",
      usage: "Placeholder text, icons",
      category: "Neutral",
      textColor: "text-white",
    },
  ];

  const hslColors = [
    {
      name: "HSL Primary",
      color: "hsl(217, 100%, 50%)",
      usage: "CSS custom property primary",
      category: "HSL",
    },
    {
      name: "HSL Accent",
      color: "hsl(30, 100%, 55%)",
      usage: "CSS custom property accent",
      category: "HSL",
      textColor: "text-black",
    },
    {
      name: "HSL Green",
      color: "hsl(142, 70%, 45%)",
      usage: "Success states",
      category: "HSL",
    },
    {
      name: "HSL Red",
      color: "hsl(0, 75%, 55%)",
      usage: "Error states",
      category: "HSL",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#003580] rounded-lg flex items-center justify-center mr-4">
              <Palette className="w-6 h-6 text-[#febb02]" />
            </div>
            <h1 className="text-4xl font-bold text-[#003580]">
              Faredown Color Palette
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Complete color system for the world's first travel bargain platform
          </p>
          <p className="text-sm text-gray-500">
            Click any color to copy its hex code
          </p>
        </div>

        {/* Brand Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-6 h-6 bg-[#003580] rounded mr-3"></div>
            Brand Colors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandColors.map((color, index) => (
              <ColorCard key={index} {...color} />
            ))}
          </div>
        </section>

        {/* Supporting Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-6 h-6 bg-[#e7f0fa] border border-gray-300 rounded mr-3"></div>
            Supporting Colors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportingColors.map((color, index) => (
              <ColorCard key={index} {...color} />
            ))}
          </div>
        </section>

        {/* System Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-6 h-6 bg-[#16a34a] rounded mr-3"></div>
            System Colors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemColors.map((color, index) => (
              <ColorCard key={index} {...color} />
            ))}
          </div>
        </section>

        {/* Neutral Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-6 h-6 bg-gray-500 rounded mr-3"></div>
            Neutral Colors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {neutralColors.map((color, index) => (
              <ColorCard key={index} {...color} />
            ))}
          </div>
        </section>

        {/* HSL Custom Properties */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Code className="w-6 h-6 text-[#003580] mr-3" />
            HSL Custom Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hslColors.map((color, index) => (
              <ColorCard key={index} {...color} />
            ))}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Usage Examples
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Desktop Example */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#003580] text-white p-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Desktop Interface</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-[#003580] text-white p-4 rounded-lg">
                    <h4 className="font-semibold">Header (Primary Blue)</h4>
                  </div>
                  <div className="flex space-x-4">
                    <button className="bg-[#febb02] hover:bg-[#e6a602] text-black px-6 py-3 rounded-lg font-semibold transition-colors">
                      Primary CTA (Yellow)
                    </button>
                    <button className="bg-[#0071c2] hover:bg-[#003580] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      Secondary (Blue)
                    </button>
                  </div>
                  <div className="bg-[#e7f0fa] p-4 rounded-lg">
                    <p className="text-[#6b6b6b]">
                      Content area with accent background and gray text
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Example */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#003580] text-white p-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Mobile Interface</h3>
              </div>
              <div className="p-6">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="bg-[#003580] text-white p-3 rounded-lg text-center">
                    <h4 className="font-semibold text-sm">Mobile Header</h4>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-[#febb02] text-black py-3 rounded-lg font-semibold">
                      Book Now
                    </button>
                    <div className="bg-[#f2f2f2] p-3 rounded-lg">
                      <p className="text-[#374151] text-sm">
                        Card content with neutral background
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#16a34a] rounded-full"></div>
                      <span className="text-[#16a34a] text-sm">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Guidelines */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Color Usage Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003580]">
                Primary Colors
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <strong>#003580:</strong> Main brand color, headers, primary
                  buttons
                </li>
                <li>
                  <strong>#febb02:</strong> Call-to-action buttons, highlights
                </li>
                <li>
                  <strong>#0071c2:</strong> Hover states, secondary actions
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003580]">
                Accessibility
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• All text meets WCAG AA contrast ratios</li>
                <li>• Color is never the only indicator</li>
                <li>• Focus states are clearly visible</li>
                <li>• Interactive elements have sufficient contrast</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003580]">
                Implementation
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use Tailwind CSS classes when possible</li>
                <li>• HSL values for CSS custom properties</li>
                <li>• Hex codes for direct styling</li>
                <li>• Consistent hover/active states</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Export Information */}
        <section className="mt-12 bg-gradient-to-r from-[#003580] to-[#0071c2] text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Export Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">CSS Variables</h3>
              <code className="text-sm bg-black/20 p-2 rounded block">
                --primary: #003580;
                <br />
                --accent: #febb02;
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tailwind Config</h3>
              <code className="text-sm bg-black/20 p-2 rounded block">
                colors: {"{"}
                'faredown-blue': '#003580'
                {"}"}
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Design Tokens</h3>
              <code className="text-sm bg-black/20 p-2 rounded block">
                brand.primary.value
                <br />
                brand.accent.value
              </code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FaredownColorPalette;
