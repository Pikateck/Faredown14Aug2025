import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import {
  Download,
  Share2,
  Wallet,
  Copy,
  Check,
  Star,
  Gift,
  Calendar,
  QrCode,
} from "lucide-react";

// QR Code generation using qrcode.js (you'll need to install this)
import QRCode from "qrcode";

interface DigitalMembershipCardProps {
  showActions?: boolean;
  variant?: "full" | "compact";
}

export default function DigitalMembershipCard({
  showActions = true,
  variant = "full",
}: DigitalMembershipCardProps) {
  const { profile, isLoading } = useLoyalty();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedMemberCode, setCopiedMemberCode] = useState(false);

  // Generate QR code for membership
  React.useEffect(() => {
    if (profile?.member?.memberCode) {
      generateQRCode();
    }
  }, [profile?.member?.memberCode]);

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      const memberData = {
        memberCode: profile?.member?.memberCode,
        tier: profile?.member?.tierName,
        name: profile?.member?.name || "Loyalty Member",
        validUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 1 year from now
      };

      const qrDataString = JSON.stringify(memberData);
      const dataUrl = await QRCode.toDataURL(qrDataString, {
        width: 120,
        margin: 1,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      });

      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyMemberCode = async () => {
    if (profile?.member?.memberCode) {
      try {
        await navigator.clipboard.writeText(profile.member.memberCode);
        setCopiedMemberCode(true);
        toast({
          title: "Copied!",
          description: "Member code copied to clipboard",
        });
        setTimeout(() => setCopiedMemberCode(false), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy member code",
          variant: "destructive",
        });
      }
    }
  };

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Faredown Rewards Card",
          text: `I'm a ${profile?.member?.tierName} member of Faredown Rewards! Member ID: ${profile?.member?.memberCode}`,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      const shareText = `I'm a ${profile?.member?.tierName} member of Faredown Rewards! Member ID: ${profile?.member?.memberCode}`;
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied!",
          description: "Card details copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Sharing not supported on this device",
          variant: "destructive",
        });
      }
    }
  };

  const downloadCard = () => {
    if (cardRef.current) {
      // Convert card to image and download
      // This would require html2canvas library for full implementation
      toast({
        title: "Download",
        description: "Download feature coming soon!",
      });
    }
  };

  const addToWallet = () => {
    // Apple Wallet/Google Pay integration would go here
    toast({
      title: "Add to Wallet",
      description: "Wallet integration coming soon!",
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile?.member) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Join Faredown Rewards
          </h3>
          <p className="text-gray-600 mb-4">
            Start earning points on every booking and unlock exclusive benefits!
          </p>
          <Button>Join Now</Button>
        </CardContent>
      </Card>
    );
  }

  const member = profile.member;
  const tier = profile.tier;

  // Determine card color scheme based on tier
  const getTierTheme = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case "gold":
        return {
          gradient: "from-yellow-400 via-yellow-500 to-yellow-600",
          accent: "text-yellow-100",
          bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        };
      case "silver":
        return {
          gradient: "from-gray-300 via-gray-400 to-gray-500",
          accent: "text-gray-100",
          bg: "bg-gradient-to-br from-gray-300 to-gray-500",
        };
      case "platinum":
        return {
          gradient: "from-purple-400 via-purple-500 to-purple-600",
          accent: "text-purple-100",
          bg: "bg-gradient-to-br from-purple-400 to-purple-600",
        };
      default: // Bronze
        return {
          gradient: "from-amber-600 via-amber-700 to-amber-800",
          accent: "text-amber-100",
          bg: "bg-gradient-to-br from-amber-600 to-amber-800",
        };
    }
  };

  const theme = getTierTheme(member.tierName);

  if (variant === "compact") {
    return (
      <Card className="w-full">
        <CardContent className={`p-4 ${theme.bg} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {member.name || "Loyalty Member"}
              </h3>
              <p className={`text-sm ${theme.accent}`}>
                {member.tierName} Member
              </p>
              <p className={`text-xs ${theme.accent}`}>#{member.memberCode}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{member.pointsBalance}</p>
              <p className={`text-xs ${theme.accent}`}>points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Main Card */}
      <Card ref={cardRef} className="overflow-hidden shadow-lg">
        <CardContent className={`p-0 ${theme.bg} text-white relative`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border border-white"></div>
          </div>

          {/* Card Header */}
          <div className="relative p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Faredown Rewards</h2>
                <Badge
                  variant="secondary"
                  className="mt-1 bg-white/20 text-white hover:bg-white/30"
                >
                  {member.tierName} Member
                </Badge>
              </div>
              <Star className="w-8 h-8 text-white/80" />
            </div>

            {/* Member Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {member.name || "Loyalty Member"}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme.accent}`}>Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date(member.joinDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${theme.accent}`}>Points Balance</p>
                  <p className="text-2xl font-bold">
                    {member.pointsBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-black/20 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-xs ${theme.accent} mb-1`}>Member ID</p>
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono">{member.memberCode}</code>
                  <button
                    onClick={copyMemberCode}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    {copiedMemberCode ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-2 rounded">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Member QR Code"
                    className="w-16 h-16"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center">
                    {isGeneratingQR ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <QrCode className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Benefits */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            Your {member.tierName} Benefits
          </h4>
          <div className="space-y-2">
            {tier?.current?.benefits?.map((benefit: string, index: number) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                {benefit}
              </div>
            )) || (
              <p className="text-sm text-gray-600">
                Benefits information not available
              </p>
            )}
          </div>

          {tier?.next && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Earn {tier.pointsToNext} more points to reach{" "}
                {tier.next.tierName}!
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tier.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={shareCard}
            className="flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={downloadCard}
            className="flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      )}

      {/* Wallet Integration */}
      <Button
        onClick={addToWallet}
        className="w-full flex items-center justify-center bg-black text-white hover:bg-gray-800"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Add to Wallet
      </Button>
    </div>
  );
}
