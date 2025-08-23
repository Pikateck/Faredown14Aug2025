/**
 * Reprice Modal Component
 * Handles inventory changes and price updates during bargaining
 */

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { formatPriceNoDecimals } from "@/lib/formatPrice";

interface RepriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  oldPrice: number;
  newPrice?: number;
  itemTitle: string;
  reason?: string;
}

export function RepriceModal({
  isOpen,
  onClose,
  onRefresh,
  oldPrice,
  newPrice,
  itemTitle,
  reason = "Inventory has changed",
}: RepriceModalProps) {
  const priceDifference = newPrice ? newPrice - oldPrice : 0;
  const isPriceIncrease = priceDifference > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Price Update Required
          </DialogTitle>
          <DialogDescription>
            {reason} and the price needs to be updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{itemTitle}</p>
          </div>

          {/* Price Comparison */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Previous Price:</span>
              <span className="line-through text-gray-400">
                {formatPriceNoDecimals(oldPrice)}
              </span>
            </div>

            {newPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Price:</span>
                <span
                  className={`font-semibold ${
                    isPriceIncrease ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatPriceNoDecimals(newPrice)}
                </span>
              </div>
            )}

            {newPrice && priceDifference !== 0 && (
              <Alert
                className={
                  isPriceIncrease ? "border-red-200" : "border-green-200"
                }
              >
                <AlertDescription
                  className={
                    isPriceIncrease ? "text-red-700" : "text-green-700"
                  }
                >
                  {isPriceIncrease
                    ? "Price increased by"
                    : "Price decreased by"}{" "}
                  {formatPriceNoDecimals(Math.abs(priceDifference))}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onRefresh} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Price & Continue
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel Bargain
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Prices can change due to inventory updates or demand fluctuations
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RepriceModal;
