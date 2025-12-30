import { Booking, FinanceData } from '@/lib/storage';

export type ViewMode = 'dashboard' | 'calendar' | 'table' | 'services' | 'portfolio' | 'photographers' | 'addons' | 'coupons' | 'users' | 'payment-settings' | 'ads';

export type FilterStatus = 'All' | 'Active' | 'Canceled' | 'Completed';

export interface Photographer {
    id: string;
    name: string;
    phone?: string;
    specialty?: string;
    is_active: boolean;
    created_at: string;
}

export interface Addon {
    id: string;
    name: string;
    price: number;
    applicable_categories?: string[];
    is_active: boolean;
    created_at: string;
}

export interface BookingUpdate {
    status?: Booking['status'];
    finance?: FinanceData;
    booking?: Booking['booking'];
    customer?: Booking['customer'];
    photographer_id?: string;
}

export interface DateRange {
    start: string;
    end: string;
}

export interface ServiceFormData {
    name: string;
    basePrice: number;
    discountValue: number;
    isActive: boolean;
    badgeText: string;
}

export interface PhotographerFormData {
    name: string;
    phone: string;
    specialty: string;
    is_active: boolean;
}

export interface AddonFormData {
    name: string;
    price: number;
    applicable_categories: string[];
    is_active: boolean;
}

export interface BookingFormData {
    customer_name: string;
    customer_whatsapp: string;
    service_id: string;
    booking_date: string;
    booking_time: string;
    booking_notes: string;
    location_link: string;
    photographer_id: string;
    dp_amount: number;
    payment_note: string;
}

export interface RescheduleFormData {
    newDate: string;
    newTime: string;
    reason: string;
}
