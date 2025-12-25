export interface Service {
    id: string;
    name: string;
    basePrice: number;
    discountValue: number;
    isActive: boolean;
    badgeText?: string;
}

export interface Addon {
    id: string;
    name: string;
    price: number;
    applicable_categories?: string[];
    is_active: boolean;
}

export interface PaymentSettings {
    id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    qris_image_url?: string;
    updated_at: string;
}

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount?: number;
    min_purchase?: number;
    valid_until?: string;
    description?: string;
    is_active: boolean;
}

export interface CouponValidation {
    valid: boolean;
    coupon?: Coupon;
    discount_amount: number;
    error?: string;
}

export interface BookingFormData {
    name: string;
    whatsapp: string;
    date: string;
    time: string;
    category: string;
    location_link: string;
    notes: string;
    dp_amount: string;
}

export interface BookingPayload {
    customer: {
        name: string;
        whatsapp: string;
        category: string;
        serviceId?: string;
    };
    booking: {
        date: string;
        notes: string;
        location_link: string;
    };
    finance: {
        total_price: number;
        payments: Array<{
            date: string;
            amount: number;
            note: string;
            proof_base64?: string;
        }>;
        service_base_price: number;
        base_discount: number;
        addons_total: number;
        coupon_discount: number;
        coupon_code?: string;
    };
    addons?: Array<{
        addon_id: string;
        addon_name: string;
        quantity: number;
        price_at_booking: number;
    }>;
}

export interface PortfolioImage {
    id: string;
    service_id: string;
    image_url: string;
    display_order: number;
    created_at: string;
}
