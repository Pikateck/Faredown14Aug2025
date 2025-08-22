/**
 * Admin Login Page
 * Secure authentication for admin users
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  User,
  Lock,
  Building,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  LogIn,
} from "lucide-react";
import { adminAuthService, DEPARTMENTS } from "@/services/adminAuthService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting admin login...");
      const response = await adminAuthService.login({
        username: formData.username,
        password: formData.password,
        department: formData.department,
      });

      console.log("Login successful, redirecting to dashboard");
      // Redirect to admin dashboard
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Faredown Admin</h1>
          <p className="text-blue-100">Secure access to admin control panel</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-semibold">
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleInputChange("department", value)
                    }
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEPARTMENTS.MANAGEMENT}>
                        Management
                      </SelectItem>
                      <SelectItem value={DEPARTMENTS.SALES}>Sales</SelectItem>
                      <SelectItem value={DEPARTMENTS.ACCOUNTS}>
                        Accounts & Finance
                      </SelectItem>
                      <SelectItem value={DEPARTMENTS.MARKETING}>
                        Marketing
                      </SelectItem>
                      <SelectItem value={DEPARTMENTS.HR}>
                        Human Resources
                      </SelectItem>
                      <SelectItem value={DEPARTMENTS.CUSTOMER_SUPPORT}>
                        Customer Support
                      </SelectItem>
                      <SelectItem value={DEPARTMENTS.IT}>
                        IT & Technical
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Demo Mode - Test Credentials:
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="font-medium">Super Admin:</span>
                  <span className="font-mono">admin / admin123</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="font-medium">Sales Manager:</span>
                  <span className="font-mono">sales / sales123</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="font-medium">Finance Team:</span>
                  <span className="font-mono">accounts / acc123</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                ℹ️ Backend server not required - works in demo mode
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-100 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure encrypted connection</span>
          </div>
          <p className="text-blue-200 text-xs mt-2">
            All admin activities are logged and monitored
          </p>
        </div>
      </div>
    </div>
  );
}
