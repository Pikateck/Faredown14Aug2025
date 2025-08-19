import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import DigitalMembershipCard from "@/components/loyalty/DigitalMembershipCard";
import QRScanner from "@/components/loyalty/QRScanner";
import WalletIntegration from "@/components/loyalty/WalletIntegration";
import {
  CreditCard,
  Scan,
  Wallet,
  Settings,
  History,
  Gift,
  Star,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Share2,
} from "lucide-react";

export default function MembershipCard() {
  const { profile, isLoading } = useLoyalty();
  const [activeTab, setActiveTab] = useState("card");
  const [showScanner, setShowScanner] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile?.member) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
            <CreditCard className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Join Faredown Rewards
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Earn points on every booking, unlock exclusive benefits, and enjoy
            personalized travel experiences.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">
              <Star className="w-4 h-4 mr-2" />
              Join Now
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const member = profile.member;
  const tier = profile.tier;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Membership Card
        </h1>
        <p className="text-gray-600">
          Your digital Faredown Rewards membership card and benefits
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {member.pointsBalance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Points Balance</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {member.pointsLifetime.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Lifetime Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Badge className="text-sm">{member.tierName}</Badge>
            <div className="text-sm text-gray-600 mt-1">Current Tier</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tier?.progress || 0}%
            </div>
            <div className="text-sm text-gray-600">Tier Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="card" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Card
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            Benefits
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Digital Card Tab */}
        <TabsContent value="card" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Digital Card */}
            <div>
              <DigitalMembershipCard />
            </div>

            {/* Card Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowWallet(true)}
                    className="w-full flex items-center justify-center"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Add to Wallet
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Card
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Card
                  </Button>
                </CardContent>
              </Card>

              {/* Member Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Member Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{member.email || "Not provided"}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>
                      Member since{" "}
                      {new Date(member.joinDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{member.tierName} Tier Benefits Active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  Your {member.tierName} Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tier?.current?.benefits?.map(
                    (benefit: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ),
                  ) || (
                    <p className="text-gray-600">
                      Benefits information not available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Tier */}
            {tier?.next && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Unlock {tier.next.tierName} Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {tier.next.tierName}</span>
                        <span>{tier.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${tier.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {tier.pointsToNext} more points needed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Additional Benefits:
                      </h4>
                      {tier.next.benefits
                        ?.slice(tier.current?.benefits?.length || 0)
                        .map((benefit: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">
                              {benefit}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tier Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>All Tier Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Benefit</th>
                      <th className="text-center py-2">Bronze</th>
                      <th className="text-center py-2">Silver</th>
                      <th className="text-center py-2">Gold</th>
                      <th className="text-center py-2">Platinum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Point Earning Rate</td>
                      <td className="text-center">1x</td>
                      <td className="text-center">1.25x</td>
                      <td className="text-center">1.5x</td>
                      <td className="text-center">2x</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Priority Support</td>
                      <td className="text-center">-</td>
                      <td className="text-center">✓</td>
                      <td className="text-center">✓</td>
                      <td className="text-center">✓</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Free Upgrades</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">✓</td>
                      <td className="text-center">✓</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Lounge Access</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scan className="w-5 h-5 mr-2" />
                  QR Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Scan QR codes at partner locations to earn points or verify
                  membership
                </p>
                <Button onClick={() => setShowScanner(true)} className="w-full">
                  <Scan className="w-4 h-4 mr-2" />
                  Open Scanner
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Digital Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add your membership card to Apple Wallet or Google Pay for
                  quick access
                </p>
                <Button
                  onClick={() => setShowWallet(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Manage Wallet
                </Button>
              </CardContent>
            </Card>

            {/* Partner Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Partner Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Find nearby partners where you can use your membership
                  benefits
                </p>
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Partners
                </Button>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Point History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View your complete points earning and redemption history
                </p>
                <Button variant="outline" className="w-full">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Preferences */}
              <div>
                <h3 className="font-medium mb-3">Contact Preferences</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">
                      Email notifications for point earnings
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">
                      SMS alerts for tier upgrades
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Marketing communications</span>
                  </label>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="font-medium mb-3">Privacy Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">
                      Allow point balance visibility to partners
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">
                      Share travel preferences with partners
                    </span>
                  </label>
                </div>
              </div>

              {/* Account Actions */}
              <div>
                <h3 className="font-medium mb-3">Account Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm">
                    Reset PIN
                  </Button>
                  <Button variant="destructive" size="sm">
                    Close Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <QRScanner onClose={() => setShowScanner(false)} />
        </div>
      )}

      {showWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <WalletIntegration onClose={() => setShowWallet(false)} />
        </div>
      )}
    </div>
  );
}
