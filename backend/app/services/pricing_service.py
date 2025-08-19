"""
Pricing Service for Faredown
Markup calculation, currency conversion, and pricing logic
"""

from typing import Dict, Any, Optional
from app.core.config import settings

class PricingService:
    """Service for handling pricing calculations and markup logic"""
    
    def __init__(self):
        self.base_currency = "INR"
        self.default_markup_min = settings.MIN_MARKUP_PERCENTAGE
        self.default_markup_max = settings.MAX_MARKUP_PERCENTAGE
    
    def calculate_markup_range(
        self, 
        booking_type: str, 
        origin: Optional[str] = None, 
        destination: Optional[str] = None,
        supplier: Optional[str] = None
    ) -> Dict[str, float]:
        """Calculate markup range for specific route/supplier"""
        
        # In production, this would query the markup database
        # For now, return default values with some route-specific adjustments
        
        base_min = self.default_markup_min
        base_max = self.default_markup_max
        
        # Route-specific adjustments (simplified logic)
        if booking_type == "flight":
            if destination and "international" in destination.lower():
                base_min += 2.0  # Higher markup for international flights
                base_max += 3.0
        elif booking_type == "hotel":
            if destination and any(city in destination.lower() for city in ["dubai", "singapore", "london"]):
                base_min += 1.5  # Higher markup for premium destinations
                base_max += 2.5
        
        return {
            "markup_min": base_min,
            "markup_max": base_max
        }
    
    def calculate_final_price(
        self,
        net_rate: float,
        markup_percentage: float,
        promo_discount: float = 0.0,
        taxes: float = 0.0,
        convenience_fee: float = 0.0
    ) -> Dict[str, float]:
        """Calculate final price with all components"""
        
        # Base price with markup
        base_price = net_rate * (1 + markup_percentage / 100)
        
        # Apply promo discount
        discounted_price = base_price - promo_discount
        
        # Add taxes and fees
        final_price = discounted_price + taxes + convenience_fee
        
        return {
            "net_rate": round(net_rate, 2),
            "markup_amount": round(base_price - net_rate, 2),
            "markup_percentage": round(markup_percentage, 2),
            "base_price": round(base_price, 2),
            "promo_discount": round(promo_discount, 2),
            "taxes": round(taxes, 2),
            "convenience_fee": round(convenience_fee, 2),
            "final_price": round(final_price, 2),
            "total_savings": round(promo_discount, 2)
        }
    
    def get_bargain_price_range(
        self,
        net_rate: float,
        markup_min: float,
        markup_max: float,
        promo_discount: float = 0.0
    ) -> Dict[str, float]:
        """Get acceptable price range for bargaining"""
        
        min_acceptable = net_rate * (1 + markup_min / 100) - promo_discount
        max_price = net_rate * (1 + markup_max / 100) - promo_discount
        
        return {
            "min_acceptable_price": round(min_acceptable, 2),
            "max_price": round(max_price, 2),
            "price_range": round(max_price - min_acceptable, 2)
        }
    
    def convert_currency(
        self,
        amount: float,
        from_currency: str,
        to_currency: str,
        exchange_rates: Optional[Dict[str, float]] = None
    ) -> float:
        """Convert amount between currencies"""
        
        if from_currency == to_currency:
            return amount
        
        # Use provided rates or default rates
        if not exchange_rates:
            exchange_rates = {
                "USD": 83.0,  # 1 USD = 83 INR
                "EUR": 90.5,  # 1 EUR = 90.5 INR
                "GBP": 105.2, # 1 GBP = 105.2 INR
                "AED": 22.6,  # 1 AED = 22.6 INR
                "SGD": 61.8   # 1 SGD = 61.8 INR
            }
        
        # Convert to INR first, then to target currency
        if from_currency == "INR":
            inr_amount = amount
        else:
            inr_amount = amount * exchange_rates.get(from_currency, 1.0)
        
        if to_currency == "INR":
            return round(inr_amount, 2)
        else:
            return round(inr_amount / exchange_rates.get(to_currency, 1.0), 2)
    
    def calculate_taxes(
        self,
        base_amount: float,
        booking_type: str,
        origin_country: str = "IN",
        destination_country: str = "IN"
    ) -> Dict[str, float]:
        """Calculate applicable taxes"""
        
        # Simplified tax calculation
        vat_rate = 0.0
        service_tax = 0.0
        
        if booking_type == "flight":
            if origin_country == "IN" and destination_country == "IN":
                vat_rate = 5.0  # Domestic flights
            else:
                vat_rate = 0.0  # International flights
        elif booking_type == "hotel":
            if destination_country == "IN":
                vat_rate = 12.0  # Domestic hotels
            else:
                vat_rate = 0.0  # International hotels
        
        vat_amount = base_amount * (vat_rate / 100)
        service_tax_amount = base_amount * (service_tax / 100)
        total_taxes = vat_amount + service_tax_amount
        
        return {
            "vat_rate": vat_rate,
            "vat_amount": round(vat_amount, 2),
            "service_tax_rate": service_tax,
            "service_tax_amount": round(service_tax_amount, 2),
            "total_taxes": round(total_taxes, 2)
        }
    
    def calculate_convenience_fee(
        self,
        booking_type: str,
        payment_method: str = "credit_card",
        booking_amount: float = 0.0
    ) -> float:
        """Calculate convenience fee"""
        
        # Base convenience fees
        base_fees = {
            "flight": 50.0,
            "hotel": 35.0,
            "package": 75.0
        }
        
        base_fee = base_fees.get(booking_type, 50.0)
        
        # Payment method adjustments
        if payment_method == "net_banking":
            base_fee *= 0.8  # 20% discount for net banking
        elif payment_method == "upi":
            base_fee *= 0.7  # 30% discount for UPI
        elif payment_method == "wallet":
            base_fee *= 0.9  # 10% discount for wallet
        
        return round(base_fee, 2)
    
    def validate_bargain_price(
        self,
        offered_price: float,
        net_rate: float,
        markup_min: float,
        markup_max: float,
        promo_discount: float = 0.0
    ) -> Dict[str, Any]:
        """Validate if bargain price is acceptable"""
        
        price_range = self.get_bargain_price_range(net_rate, markup_min, markup_max, promo_discount)
        min_acceptable = price_range["min_acceptable_price"]
        max_price = price_range["max_price"]
        
        is_acceptable = min_acceptable <= offered_price <= max_price
        
        # Calculate profit margin
        actual_profit = offered_price - net_rate + promo_discount
        profit_margin = (actual_profit / offered_price) * 100 if offered_price > 0 else 0
        
        return {
            "is_acceptable": is_acceptable,
            "offered_price": offered_price,
            "min_acceptable": min_acceptable,
            "max_price": max_price,
            "profit_margin": round(profit_margin, 2),
            "margin_category": self._categorize_margin(profit_margin),
            "recommendation": self._get_pricing_recommendation(profit_margin, is_acceptable)
        }
    
    def _categorize_margin(self, profit_margin: float) -> str:
        """Categorize profit margin"""
        if profit_margin < 5:
            return "low"
        elif profit_margin < 10:
            return "moderate"
        elif profit_margin < 15:
            return "good"
        else:
            return "excellent"
    
    def _get_pricing_recommendation(self, profit_margin: float, is_acceptable: bool) -> str:
        """Get pricing recommendation"""
        if not is_acceptable:
            return "reject_offer"
        elif profit_margin < 5:
            return "accept_cautiously"
        elif profit_margin < 10:
            return "consider_accepting"
        else:
            return "accept_immediately"
