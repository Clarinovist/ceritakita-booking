import { NextRequest, NextResponse } from 'next/server';

export interface MetaInsightsData {
  spend: number;
  impressions: number;
  inlineLinkClicks: number;
  reach: number;
  date_start: string;
  date_end: string;
}

export interface MetaInsightsResponse {
  success: boolean;
  data?: MetaInsightsData;
  error?: string;
}

// Helper function to get date range for "This Month"
function getThisMonthDateRange(): { start: string; end: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: firstDay.toISOString().split('T')[0]!,
    end: lastDay.toISOString().split('T')[0]!,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<MetaInsightsResponse>> {
  try {
    // Get environment variables
    const accessToken = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;
    const apiVersion = process.env.META_API_VERSION || 'v19.0';

    // Validate environment variables
    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required environment variables: META_ACCESS_TOKEN or META_AD_ACCOUNT_ID',
        },
        { status: 500 }
      );
    }

    // Get date range (This Month)
    const { start, end } = getThisMonthDateRange();

    // Build Meta API URL
    const url = `https://graph.facebook.com/${apiVersion}/${adAccountId}/insights`;
    
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'spend,impressions,inline_link_clicks,reach',
      time_range: JSON.stringify({ since: start, until: end }),
      time_increment: 'all_data',
      level: 'account',
    });

    const apiUrl = `${url}?${params.toString()}`;

    // Fetch data from Meta API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Meta API Error:', errorData);
      
      // Handle specific error codes
      if (errorData?.error?.code === 190) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired access token. Please update META_ACCESS_TOKEN.',
          },
          { status: 401 }
        );
      }
      
      if (errorData?.error?.code === 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid ad account ID format. Ensure it starts with "act_" followed by numbers.',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: errorData?.error?.message || 'Failed to fetch data from Meta API',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check if data exists
    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            spend: 0,
            impressions: 0,
            inlineLinkClicks: 0,
            reach: 0,
            date_start: start,
            date_end: end,
          },
        },
        { status: 200 }
      );
    }

    // Extract metrics from the first (and only) data point
    const insights = data.data[0];
    const result: MetaInsightsData = {
      spend: parseFloat(insights.spend || '0'),
      impressions: parseInt(insights.impressions || '0'),
      inlineLinkClicks: parseInt(insights.inline_link_clicks || '0'),
      reach: parseInt(insights.reach || '0'),
      date_start: start,
      date_end: end,
    };

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in Meta insights API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
