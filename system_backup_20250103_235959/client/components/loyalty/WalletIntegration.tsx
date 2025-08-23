import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import {
  Wallet,
  Download,
  Smartphone,
  Apple,
  Chrome,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface WalletIntegrationProps {
  onClose?: () => void;
}

export default function WalletIntegration({ onClose }: WalletIntegrationProps) {
  const { profile } = useLoyalty();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPasses, setGeneratedPasses] = useState<{
    apple?: string;
    google?: string;
  }>({});

  // Detect user's device and browser
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent);

  const generateAppleWalletPass = async () => {
    if (!profile?.member) return;

    try {
      setIsGenerating(true);

      // In a real implementation, this would call your backend API
      // to generate a .pkpass file using the Apple PassKit framework
      const passData = {
        memberCode: profile.member.memberCode,
        name: profile.member.name || "Loyalty Member",
        tier: profile.member.tierName,
        pointsBalance: profile.member.pointsBalance,
        validUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      // Mock API call to generate Apple Wallet pass
      const response = await fetch("/api/loyalty/generate-apple-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create download link for .pkpass file
        const link = document.createElement("a");
        link.href = url;
        link.download = `faredown-rewards-${profile.member.memberCode}.pkpass`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setGeneratedPasses((prev) => ({ ...prev, apple: url }));
        toast({
          title: "Apple Wallet Pass Generated",
          description:
            "Pass downloaded successfully. Tap to add to Apple Wallet.",
        });
      } else {
        throw new Error("Failed to generate Apple Wallet pass");
      }
    } catch (error) {
      console.error("Error generating Apple Wallet pass:", error);
      toast({
        title: "Error",
        description: "Failed to generate Apple Wallet pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGoogleWalletPass = async () => {
    if (!profile?.member) return;

    try {
      setIsGenerating(true);

      // In a real implementation, this would use Google Wallet API
      // to create a digital pass that can be added to Google Pay
      const passData = {
        memberCode: profile.member.memberCode,
        name: profile.member.name || "Loyalty Member",
        tier: profile.member.tierName,
        pointsBalance: profile.member.pointsBalance,
        validUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      // Mock API call to generate Google Wallet pass URL
      const response = await fetch("/api/loyalty/generate-google-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passData),
      });

      if (response.ok) {
        const { passUrl } = await response.json();

        // Open Google Wallet add-to-wallet URL
        window.open(passUrl, "_blank");

        setGeneratedPasses((prev) => ({ ...prev, google: passUrl }));
        toast({
          title: "Google Wallet Pass Generated",
          description: "Opening Google Wallet to add your pass.",
        });
      } else {
        throw new Error("Failed to generate Google Wallet pass");
      }
    } catch (error) {
      console.error("Error generating Google Wallet pass:", error);
      toast({
        title: "Error",
        description: "Failed to generate Google Wallet pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGenericPass = async () => {
    if (!profile?.member) return;

    try {
      setIsGenerating(true);

      // Generate a generic digital pass (PDF or image)
      const passData = {
        memberCode: profile.member.memberCode,
        name: profile.member.name || "Loyalty Member",
        tier: profile.member.tierName,
        pointsBalance: profile.member.pointsBalance,
        qrCode: true,
      };

      const response = await fetch("/api/loyalty/generate-digital-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `faredown-rewards-${profile.member.memberCode}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Digital Pass Downloaded",
          description: "Your digital membership pass has been downloaded.",
        });
      } else {
        throw new Error("Failed to generate digital pass");
      }
    } catch (error) {
      console.error("Error generating digital pass:", error);
      toast({
        title: "Error",
        description: "Failed to generate digital pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile?.member) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Membership Found
          </h3>
          <p className="text-gray-600">
            You need to be a Faredown Rewards member to add passes to your
            wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="w-5 h-5 mr-2" />
          Add to Wallet
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add your Faredown Rewards card to your mobile wallet for easy access
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Member Info Preview */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">
                {profile.member.name || "Loyalty Member"}
              </h3>
              <p className="text-sm opacity-90">
                {profile.member.tierName} Member
              </p>
              <p className="text-xs opacity-75">#{profile.member.memberCode}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {profile.member.pointsBalance.toLocaleString()}
              </p>
              <p className="text-xs opacity-75">points</p>
            </div>
          </div>
        </div>

        {/* Wallet Options */}
        <div className="space-y-3">
          {/* Apple Wallet */}
          {(isIOS || isSafari) && (
            <Button
              onClick={generateAppleWalletPass}
              disabled={isGenerating}
              className="w-full flex items-center justify-center bg-black text-white hover:bg-gray-800"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Apple className="w-4 h-4 mr-2" />
              )}
              Add to Apple Wallet
            </Button>
          )}

          {/* Google Wallet */}
          {(isAndroid || isChrome) && (
            <Button
              onClick={generateGoogleWalletPass}
              disabled={isGenerating}
              className="w-full flex items-center justify-center bg-green-600 text-white hover:bg-green-700"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Chrome className="w-4 h-4 mr-2" />
              )}
              Add to Google Wallet
            </Button>
          )}

          {/* Generic Digital Pass */}
          <Button
            onClick={generateGenericPass}
            disabled={isGenerating}
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download Digital Pass
          </Button>
        </div>

        {/* Generated Passes Status */}
        {(generatedPasses.apple || generatedPasses.google) && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium text-gray-900">
              Generated Passes
            </h4>

            {generatedPasses.apple && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apple Wallet pass generated
              </div>
            )}

            {generatedPasses.google && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Google Wallet pass generated
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            How it works:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Your membership card will be stored in your mobile wallet</li>
            <li>• Use it at partner locations for quick verification</li>
            <li>• Points balance updates automatically</li>
            <li>• Works offline for basic member verification</li>
          </ul>
        </div>

        {/* Device Compatibility */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Smartphone className="w-3 h-3 mr-1" />
              {isIOS
                ? "iOS Device"
                : isAndroid
                  ? "Android Device"
                  : "Mobile Device"}
            </div>
            <div className="flex items-center">
              <Wallet className="w-3 h-3 mr-1" />
              Wallet Ready
            </div>
          </div>

          {!isIOS && !isAndroid && (
            <p className="text-xs text-amber-600">
              For best experience, use a mobile device with wallet support
            </p>
          )}
        </div>

        {/* External Wallet Links */}
        <div className="flex space-x-2">
          {isIOS && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              asChild
            >
              <a
                href="https://support.apple.com/en-us/HT204003"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Apple Wallet Help
              </a>
            </Button>
          )}

          {isAndroid && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              asChild
            >
              <a
                href="https://support.google.com/pay/answer/7644132"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Google Wallet Help
              </a>
            </Button>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Done
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
