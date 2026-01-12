
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readBooking, updateBooking } from '@/lib/storage-sqlite';
import { addPriceAdjustment } from '@/lib/price-adjustments';
import { priceAdjustmentSchema } from '@/lib/validation';
import { logger, createErrorResponse } from '@/lib/logger';

/**
 * POST /api/bookings/adjust-price
 * Quick endpoint for price adjustments
 */
export async function POST(req: NextRequest) {
    const requestId = crypto.randomUUID();

    try {
        // Auth check
        const authCheck = await requireAuth(req);
        if (authCheck) return authCheck;

        // Parse and validate
        const body = await req.json();
        const validation = priceAdjustmentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', issues: validation.error.issues },
                { status: 400 }
            );
        }

        const { booking_id, addon_id, quantity, price, reason } = validation.data;

        // Get current booking
        const currentBooking = readBooking(booking_id);
        if (!currentBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Validate status
        if (currentBooking.status !== 'Active') {
            return NextResponse.json(
                { error: 'Can only adjust price for Active bookings' },
                { status: 400 }
            );
        }

        // Calculate adjustment
        const { newAddons, newTotalPrice } = await addPriceAdjustment(currentBooking, {
            bookingId: booking_id,
            addonId: addon_id,
            quantity,
            customPrice: price,
            reason
        });

        // Update booking
        await updateBooking({
            ...currentBooking,
            addons: newAddons,
            finance: {
                ...currentBooking.finance,
                addons_total: newAddons.reduce((sum, a) => sum + (a.price_at_booking * a.quantity), 0),
                total_price: newTotalPrice
            }
        });

        logger.info('Price adjustment applied', {
            bookingId: booking_id,
            oldTotal: currentBooking.finance.total_price,
            newTotal: newTotalPrice,
            addonId: addon_id,
            reason,
            requestId
        });

        return NextResponse.json({
            success: true,
            booking_id,
            old_total: currentBooking.finance.total_price,
            new_total: newTotalPrice,
            adjustment: newTotalPrice - currentBooking.finance.total_price
        });

    } catch (error) {
        const { error: errorResponse, statusCode } = createErrorResponse(error as Error, requestId);
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}
