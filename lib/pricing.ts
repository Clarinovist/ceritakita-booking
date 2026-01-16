/**
 * Centralized Pricing Logic
 * Shared between Frontend (Estimation) and Backend (Validation)
 */

export interface PricingBreakdown {
    serviceBasePrice: number;
    baseDiscount: number;
    addonsTotal: number;
    couponDiscount: number;
    total: number;
}

/**
 * Calculate total price for add-ons
 */
export function calculateAddonsTotal(addons: { price: number; quantity: number }[]): number {
    if (!addons || !Array.isArray(addons)) return 0;
    return addons.reduce((total, addon) => total + (addon.price * addon.quantity), 0);
}

/**
 * Calculate complete pricing breakdown
 */
export function calculateDetailedPricing(
    service: { basePrice: number; discountValue: number } | null | undefined,
    addons: { price: number; quantity: number }[] = [],
    couponDiscount: number = 0
): PricingBreakdown {
    if (!service) {
        return {
            serviceBasePrice: 0,
            baseDiscount: 0,
            addonsTotal: 0,
            couponDiscount: 0,
            total: 0
        };
    }

    const serviceBasePrice = service.basePrice;
    const baseDiscount = service.discountValue;
    const addonsTotal = calculateAddonsTotal(addons);

    // Formula: Grand Total = (Service Base + Add-ons) - Base Discount - Coupon Discount
    const total = Math.max(0, serviceBasePrice + addonsTotal - baseDiscount - couponDiscount);

    return {
        serviceBasePrice,
        baseDiscount,
        addonsTotal,
        couponDiscount,
        total
    };
}
