import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ArrowUp,
  ArrowDown,
  Clock,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
  Calendar,
} from "lucide-react";
import {
  loyaltyService,
  TransactionHistoryItem,
} from "../../services/loyaltyService";

interface LoyaltyHistoryProps {
  onBack?: () => void;
}

export function LoyaltyHistory({ onBack }: LoyaltyHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const loadTransactions = async (reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await loyaltyService.getTransactionHistory(
        limit,
        currentOffset,
      );

      if (reset) {
        setTransactions(response.items);
        setOffset(response.items.length);
      } else {
        setTransactions((prev) => [...prev, ...response.items]);
        setOffset((prev) => prev + response.items.length);
      }

      setHasMore(response.pagination.hasMore);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transaction history",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(true);
  }, []);

  const getTransactionIcon = (eventType: string, pointsDelta: number) => {
    if (pointsDelta > 0) {
      return <ArrowUp className="w-4 h-4 text-green-600" />;
    } else {
      return <ArrowDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getTransactionLabel = (eventType: string) => {
    switch (eventType) {
      case "earn":
        return { label: "Earned", color: "bg-green-100 text-green-800" };
      case "redeem":
        return { label: "Redeemed", color: "bg-blue-100 text-blue-800" };
      case "adjust":
        return { label: "Adjustment", color: "bg-yellow-100 text-yellow-800" };
      case "expire":
        return { label: "Expired", color: "bg-gray-100 text-gray-800" };
      case "revoke":
        return { label: "Revoked", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Unable to load transaction history
              </p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTransactions(true)}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction History
            </h2>
            <p className="text-sm text-gray-600">
              Your complete points earning and redemption history
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadTransactions(true)}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && transactions.length === 0 ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-sm text-gray-600">
                Start booking to earn your first points!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((transaction, index) => {
                const { date, time } = formatDate(transaction.createdAt);
                const { label, color } = getTransactionLabel(
                  transaction.eventType,
                );

                return (
                  <div
                    key={`${transaction.id}-${index}`}
                    className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getTransactionIcon(
                        transaction.eventType,
                        transaction.pointsDelta,
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description || `${label} points`}
                        </p>
                        <Badge className={`text-xs ${color}`}>{label}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {date} at {time}
                        </span>
                        {transaction.bookingId && (
                          <span>Booking: {transaction.bookingId}</span>
                        )}
                        {transaction.rupeeValue && (
                          <span>
                            Value:{" "}
                            {loyaltyService.formatRupees(
                              transaction.rupeeValue,
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          transaction.pointsDelta > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.pointsDelta > 0 ? "+" : ""}
                        {loyaltyService.formatPoints(transaction.pointsDelta)}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="p-6 border-t">
              <Button
                variant="outline"
                onClick={() => loadTransactions(false)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Load More Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoyaltyHistory;
