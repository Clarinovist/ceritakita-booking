import { NextRequest, NextResponse } from 'next/server';
import { getAdsLog } from '@/lib/storage-sqlite';

export interface AdsHistoryRecord {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  date_record: string;
  updated_at: string;
}

export interface AdsHistoryResponse {
  success: boolean;
  data?: AdsHistoryRecord[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<AdsHistoryResponse>> {
  try {
    // Get query parameters for optional filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '7');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Get ads log data from database
    // The getAdsLog function can handle different query types
    const adsData = getAdsLog(undefined, startDate, endDate, limit);

    // Transform the data to match the expected format
    const historyData: AdsHistoryRecord[] = adsData.map(record => ({
      spend: record.spend,
      impressions: record.impressions,
      clicks: record.inlineLinkClicks,
      reach: record.reach,
      date_record: record.date_start || '',
      updated_at: record.updated_at || new Date().toISOString()  // Fixed: use actual updated_at from database
    }));

    return NextResponse.json(
      {
        success: true,
        data: historyData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching ads history:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ads history',
      },
      { status: 500 }
    );
  }
}