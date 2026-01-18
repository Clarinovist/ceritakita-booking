import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getPerformanceStats } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/monitoring
 * Fetch performance metrics for the admin dashboard
 */
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session || user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const moduleName = searchParams.get('module') || undefined;
        const days = parseInt(searchParams.get('days') || '7');

        const stats = await getPerformanceStats(moduleName, days);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching monitoring stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch monitoring stats' },
            { status: 500 }
        );
    }
}
