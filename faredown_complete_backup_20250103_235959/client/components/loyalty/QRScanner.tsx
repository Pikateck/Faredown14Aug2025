import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Scan,
  Upload,
  User,
  Star,
} from "lucide-react";

// QR Code scanner using qr-scanner library (you'll need to install this)
// import QrScanner from 'qr-scanner';

interface MemberData {
  memberCode: string;
  tier: string;
  name: string;
  validUntil: string;
}

interface ScannedMember {
  memberCode: string;
  name: string;
  tier: string;
  pointsBalance: number;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  validUntil: string;
}

interface QRScannerProps {
  onMemberScanned?: (member: ScannedMember) => void;
  onClose?: () => void;
  mode?: "scanner" | "upload";
}

export default function QRScanner({
  onMemberScanned,
  onClose,
  mode = "scanner",
}: QRScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scannedMember, setScannedMember] = useState<ScannedMember | null>(
    null,
  );
  const [error, setError] = useState<string>("");
  const [scanMode, setScanMode] = useState<"camera" | "file">(
    mode === "upload" ? "file" : "camera",
  );

  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      setHasCamera(videoDevices.length > 0);
    } catch (error) {
      console.error("Error checking camera availability:", error);
      setHasCamera(false);
    }
  };

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Initialize QR scanner (mock implementation)
      // In a real implementation, you'd use qr-scanner library
      simulateQRScanning();
    } catch (error) {
      console.error("Error starting camera:", error);
      setError("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Mock QR scanning simulation (replace with actual QR scanner)
  const simulateQRScanning = () => {
    // This is a mock - in real implementation, you'd continuously scan the video feed
    setTimeout(() => {
      const mockQRData = JSON.stringify({
        memberCode: "FDR2024001234",
        tier: "Gold",
        name: "John Doe",
        validUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });
      handleQRCodeDetected(mockQRData);
    }, 3000);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    try {
      const memberData: MemberData = JSON.parse(qrData);

      // Validate QR code structure
      if (!memberData.memberCode || !memberData.tier) {
        throw new Error("Invalid membership QR code");
      }

      // Check if card is still valid
      const validUntil = new Date(memberData.validUntil);
      const isExpired = validUntil < new Date();

      // Fetch member details from server (mock implementation)
      const memberDetails = await fetchMemberDetails(memberData.memberCode);

      setScannedMember({
        ...memberDetails,
        status: isExpired ? "EXPIRED" : memberDetails.status,
      });

      stopScanning();

      if (onMemberScanned) {
        onMemberScanned(memberDetails);
      }

      toast({
        title: "Member Scanned Successfully",
        description: `${memberDetails.name} (${memberDetails.tier} Member)`,
      });
    } catch (error) {
      console.error("Error processing QR code:", error);
      setError("Invalid or corrupted QR code");
      toast({
        title: "Scan Error",
        description: "Unable to read membership QR code",
        variant: "destructive",
      });
    }
  };

  // Mock member details fetch (replace with actual API call)
  const fetchMemberDetails = async (
    memberCode: string,
  ): Promise<ScannedMember> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      memberCode,
      name: "John Doe",
      tier: "Gold",
      pointsBalance: 15420,
      status: "ACTIVE",
      validUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;

        // In real implementation, you'd use a QR code reading library
        // For now, simulate successful scan
        setTimeout(() => {
          const mockData = JSON.stringify({
            memberCode: "FDR2024005678",
            tier: "Silver",
            name: "Jane Smith",
            validUntil: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          });
          handleQRCodeDetected(mockData);
        }, 1500);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setError("Unable to read uploaded image");
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      case "platinum":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  if (scannedMember) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            Member Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Member Info */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <User className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold">{scannedMember.name}</h3>
            <div className="flex justify-center space-x-2">
              <Badge className={getTierColor(scannedMember.tier)}>
                <Star className="w-3 h-3 mr-1" />
                {scannedMember.tier} Member
              </Badge>
              <Badge className={getMemberStatusColor(scannedMember.status)}>
                {scannedMember.status}
              </Badge>
            </div>
          </div>

          {/* Member Details */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-gray-600">Member Code:</span>
              <span className="font-mono text-sm">
                {scannedMember.memberCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Points Balance:</span>
              <span className="font-semibold">
                {scannedMember.pointsBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valid Until:</span>
              <span>
                {new Date(scannedMember.validUntil).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setScannedMember(null);
                if (scanMode === "camera") {
                  startScanning();
                }
              }}
            >
              Scan Another
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Scan className="w-5 h-5 mr-2" />
            Scan Membership Card
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="flex space-x-2">
          <Button
            variant={scanMode === "camera" ? "default" : "outline"}
            size="sm"
            onClick={() => setScanMode("camera")}
            disabled={!hasCamera}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={scanMode === "file" ? "default" : "outline"}
            size="sm"
            onClick={() => setScanMode("file")}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Camera Scanner */}
        {scanMode === "camera" && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>

                      {/* Scanning Line Animation */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 animate-pulse"></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {!isScanning && hasCamera && (
              <Button onClick={startScanning} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            )}

            {isScanning && (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="w-full"
              >
                Stop Scanning
              </Button>
            )}

            {!hasCamera && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">
                  Camera not available. Please use the upload option instead.
                </p>
              </div>
            )}
          </div>
        )}

        {/* File Upload */}
        {scanMode === "file" && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload QR code image</p>
              <p className="text-sm text-gray-500">
                Click to select a file or drag and drop
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Position the QR code within the scanning area</p>
          <p>Ensure good lighting for best results</p>
        </div>
      </CardContent>
    </Card>
  );
}
