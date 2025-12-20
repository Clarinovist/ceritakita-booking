import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, readServices, Booking } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
    // Require authentication for viewing bookings
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    const data = readData();
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input using Zod
        const validationResult = createBookingSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.issues },
                { status: 400 }
            );
        }

        const { customer, booking, finance } = validationResult.data;

        // Backend Price Validation
        const services = readServices();
        const service = services.find(s => s.id === customer.serviceId);

        let validatedTotalPrice = 0;
        if (service && service.isActive) {
            validatedTotalPrice = service.basePrice - service.discountValue;
        } else if (service && !service.isActive) {
            return NextResponse.json(
                { error: 'Selected service is not available' },
                { status: 400 }
            );
        } else {
            return NextResponse.json(
                { error: 'Invalid service selected' },
                { status: 400 }
            );
        }

        const newBooking: Booking = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            status: 'Active',
            customer,
            booking,
            finance: {
                total_price: validatedTotalPrice,
                payments: finance?.payments || []
            }
        };

        const data = readData();
        data.push(newBooking);
        await writeData(data);

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
