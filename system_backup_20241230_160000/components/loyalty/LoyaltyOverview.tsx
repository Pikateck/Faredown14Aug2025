import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import {
  Trophy,
  Star,
  TrendingUp,
  Gift,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useLoyalty } from "../../contexts/LoyaltyContext";
import { loyaltyService } from "../../services/loyaltyService";

interface LoyaltyOverviewProps {
  onViewHistory?: () => void;
}

export function LoyaltyOverview({ onViewHistory }: LoyaltyOverviewProps) {
  const { profile, isLoading, error } = useLoyalty();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Unable to load loyalty information
              </p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Join Faredown Rewards
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Start earning points on every booking and unlock exclusive
              benefits.
            </p>
            <Button>Get Started</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { member, tier, expiringSoon } = profile;

  return (
    <div className="space-y-6">
      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Balance Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Points Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">
                {loyaltyService.formatPoints(member.pointsBalance)}
              </div>
              {member.pointsLocked > 0 && (
                <div className="text-sm text-amber-600">
                  {loyaltyService.formatPoints(member.pointsLocked)} locked
                </div>
              )}
              <div className="text-sm text-gray-600">
                Value:{" "}
                {loyaltyService.formatRupees((member.pointsBalance / 100) * 10)}
              </div>
            </div>
          </CardContent>
          <div className="absolute top-4 right-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Card>

        {/* Tier Status Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Membership Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    tier.current.tier === 3
                      ? "default"
                      : tier.current.tier === 2
                        ? "secondary"
                        : "outline"
                  }
                  className="text-sm"
                >
                  {tier.current.tierName}
                </Badge>
                <span className="text-sm text-gray-500">
                  Level {tier.current.tier}
                </span>
              </div>

              {tier.next && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {loyaltyService.formatPoints(tier.pointsToNext)} to{" "}
                    {tier.next.tierName}
                  </div>
                  <Progress value={tier.progress} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {tier.progress}% complete
                  </div>
                </div>
              )}

              {!tier.next && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">Highest Tier</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lifetime Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {loyaltyService.formatPoints(member.pointsLifetime)}
                </div>
                <div className="text-sm text-gray-600">Lifetime Points</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {loyaltyService.formatPoints(member.points12m)}
                </div>
                <div className="text-sm text-gray-600">Last 12 months</div>
              </div>
              <div className="text-xs text-gray-500">
                Member since {new Date(member.joinDate).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Points Alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-800 mb-1">
                  Points Expiring Soon
                </h4>
                <p className="text-sm text-amber-700 mb-2">
                  You have{" "}
                  {loyaltyService.formatPoints(
                    expiringSoon.reduce((sum, item) => sum + item.points, 0),
                  )}{" "}
                  points expiring in the next 60 days.
                </p>
                <div className="space-y-1">
                  {expiringSoon.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-xs text-amber-600">
                      {loyaltyService.formatPoints(item.points)} points expire
                      on {new Date(item.expireOn).toLocaleDateString()}(
                      {item.daysRemaining} days)
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Redeem Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Your {tier.current.tierName} Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Current Benefits</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Member hotel prices
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Earn & redeem points
                </li>
                {tier.current.tier >= 2 && (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      10% bonus points
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Priority support
                    </li>
                  </>
                )}
                {tier.current.tier >= 3 && (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      20% bonus points
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Room upgrades
                    </li>
                  </>
                )}
              </ul>
            </div>

            {tier.next && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Unlock at {tier.next.tierName}
                </h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {tier.next.tier === 2
                      ? "10% bonus points"
                      : "20% bonus points"}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {tier.next.tier === 2
                      ? "Priority support"
                      : "Room upgrades"}
                  </li>
                  {tier.next.tier === 3 && (
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      Dedicated support
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {onViewHistory && (
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onViewHistory}
                className="w-full sm:w-auto"
              >
                View Transaction History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoyaltyOverview;
