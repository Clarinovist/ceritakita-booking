import { getDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import { AdsData } from '@/lib/types';

/**
 * Database row interface for ads_performance_log table
 */
interface AdsLogRow {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  date_record: string;
  updated_at: string;
}

/**
 * Save Meta Ads performance data to database with DAILY granularity
 * Uses INSERT OR REPLACE to upsert daily records
 * Each dashboard load will update today's data
 */
export function saveAdsLog(data: AdsData): void {
  const db = getDb();

  // Validate data - check for negative values
  if (data.spend < 0 || data.impressions < 0 || data.inlineLinkClicks < 0 || data.reach < 0) {
    logger.warn('Invalid ads data - negative values detected, skipping save', {
      spend: data.spend,
      impressions: data.impressions,
      clicks: data.inlineLinkClicks,
      reach: data.reach
    });
    return;
  }

  // Allow saving even if zero data for daily tracking continuity
  // This helps maintain a complete daily timeline

  // Use date_start as the record date (YYYY-MM-DD format)
  // If not provided, use today's date
  let dateRecord: string;
  if (data.date_start) {
    // Use the actual date from the API response
    dateRecord = data.date_start;
  } else {
    // Fallback to today's date
    const now = new Date();
    dateRecord = now.toISOString().split('T')[0] || '';
  }

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO ads_performance_log (
        date_record, spend, impressions, clicks, reach, updated_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      dateRecord,
      data.spend,
      data.impressions,
      data.inlineLinkClicks,
      data.reach
    );

    logger.info('Saved daily ads performance log', {
      date_record: dateRecord,
      spend: data.spend,
      impressions: data.impressions,
      clicks: data.inlineLinkClicks,
      reach: data.reach
    });
  } catch (error) {
    logger.error('Failed to save ads performance log', {
      error: error instanceof Error ? error.message : String(error),
      date_record: dateRecord,
      data
    });
    throw error;
  }
}

/**
 * Save multiple Meta Ads performance data logs in a single transaction
 * @param dataList Array of AdsData objects
 */
export function saveAdsLogBatch(dataList: AdsData[]): void {
  const db = getDb();

  if (dataList.length === 0) return;

  const validDataList = dataList.filter(data => {
    if (data.spend < 0 || data.impressions < 0 || data.inlineLinkClicks < 0 || data.reach < 0) {
      logger.warn('Invalid ads data - negative values detected, skipping save', {
        spend: data.spend,
        impressions: data.impressions,
        clicks: data.inlineLinkClicks,
        reach: data.reach
      });
      return false;
    }
    return true;
  });

  if (validDataList.length === 0) return;

  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO ads_performance_log (
        date_record, spend, impressions, clicks, reach, updated_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    for (const data of validDataList) {
      let dateRecord: string;
      if (data.date_start) {
        dateRecord = data.date_start;
      } else {
        const now = new Date();
        dateRecord = now.toISOString().split('T')[0] || '';
      }

      stmt.run(
        dateRecord,
        data.spend,
        data.impressions,
        data.inlineLinkClicks,
        data.reach
      );
    }
  });

  try {
    transaction();
    logger.info('Saved batched ads performance logs', { count: validDataList.length });
  } catch (error) {
    logger.error('Failed to save batched ads performance logs', {
      error: error instanceof Error ? error.message : String(error),
      count: validDataList.length
    });
    throw error;
  }
}

/**
 * Backfill historical ads data for the last N days
 * This is a one-time operation to populate historical daily data
 * @param accessToken - Meta access token
 * @param adAccountId - Meta ad account ID
 * @param days - Number of days to backfill (default: 30)
 * @param apiVersion - Meta API version (default: v19.0)
 * @returns Object with success status and number of days backfilled
 */
export async function backfillAdsHistory(
  accessToken: string,
  adAccountId: string,
  days: number = 30,
  apiVersion: string = 'v19.0'
): Promise<{ success: boolean; daysBackfilled: number; errors: string[] }> {
  const errors: string[] = [];
  let daysBackfilled = 0;
  const adsDataList: AdsData[] = [];

  logger.info('Starting ads history backfill', { days });

  try {
    const today = new Date();
    const url = `https://graph.facebook.com/${apiVersion}/${adAccountId}/insights`;

    // Fetch data for each day in the past N days
    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];

      try {
        const params = new URLSearchParams({
          access_token: accessToken,
          fields: 'spend,impressions,inline_link_clicks,reach',
          time_range: JSON.stringify({ since: dateStr, until: dateStr }),
          level: 'account',
        });

        const apiUrl = `${url}?${params.toString()}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          errors.push(`${dateStr}: ${errorData?.error?.message || 'API error'}`);
          logger.warn('Backfill API error for date', { date: dateStr, error: errorData });
          continue;
        }

        const data = await response.json();

        // Extract data or use zeros if no data
        const insights = data.data?.[0];
        const adsData: AdsData = {
          spend: parseFloat(insights?.spend || '0'),
          impressions: parseInt(insights?.impressions || '0'),
          inlineLinkClicks: parseInt(insights?.inline_link_clicks || '0'),
          reach: parseInt(insights?.reach || '0'),
          date_start: dateStr,
          date_end: dateStr,
        };

        // Collect data to save in batch later
        adsDataList.push(adsData);
        daysBackfilled++;

        // Small delay to avoid rate limiting (100ms between requests)
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (dayError) {
        const errMsg = dayError instanceof Error ? dayError.message : String(dayError);
        errors.push(`${dateStr}: ${errMsg}`);
        logger.error('Backfill error for specific day', { date: dateStr, error: errMsg });
      }
    }

    // Save all collected data in one batch
    if (adsDataList.length > 0) {
      saveAdsLogBatch(adsDataList);
    }

    logger.info('Completed ads history backfill', {
      daysBackfilled,
      totalDays: days,
      errors: errors.length
    });

    return {
      success: errors.length < days, // Success if at least some days were backfilled
      daysBackfilled,
      errors
    };

  } catch (error) {
    logger.error('Backfill operation failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      success: false,
      daysBackfilled,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Get ads performance data for a specific day or date range
 * @param dateRecord - Specific day to retrieve (YYYY-MM-DD format)
 * @param startDate - Start date for range query (YYYY-MM-DD)
 * @param endDate - End date for range query (YYYY-MM-DD)
 * @param limit - Maximum number of records to return (default: 30 days)
 * @returns Array of ads performance data
 */
export function getAdsLog(
  dateRecord?: string,
  startDate?: string,
  endDate?: string,
  limit: number = 30
): AdsData[] {
  try {
    const db = getDb();

    // Helper function to map database row to AdsData
    const mapRowToAdsData = (row: AdsLogRow): AdsData => ({
      spend: row.spend,
      impressions: row.impressions,
      inlineLinkClicks: row.clicks,
      reach: row.reach,
      date_start: row.date_record,
      date_end: row.date_record,
      updated_at: row.updated_at  // Include updated_at for history tracking
    });

    if (dateRecord) {
      // Get specific month
      const stmt = db.prepare(`
        SELECT spend, impressions, clicks, reach, date_record, updated_at
        FROM ads_performance_log
        WHERE date_record = ?
        ORDER BY updated_at DESC
        LIMIT 1
      `);
      const rows = stmt.all(dateRecord) as AdsLogRow[];
      return rows.map(mapRowToAdsData);
    } else if (startDate && endDate) {
      // Get date range
      const stmt = db.prepare(`
        SELECT spend, impressions, clicks, reach, date_record, updated_at
        FROM ads_performance_log
        WHERE date_record >= ? AND date_record <= ?
        ORDER BY date_record ASC
      `);
      const rows = stmt.all(startDate, endDate) as AdsLogRow[];
      return rows.map(mapRowToAdsData);
    } else {
      // Get recent records with LIMIT to prevent unbounded results
      const stmt = db.prepare(`
        SELECT spend, impressions, clicks, reach, date_record, updated_at
        FROM ads_performance_log
        ORDER BY date_record DESC
        LIMIT ?
      `);
      const rows = stmt.all(limit) as AdsLogRow[];
      return rows.map(mapRowToAdsData);
    }
  } catch (error) {
    logger.error('Failed to retrieve ads performance log', {
      error: error instanceof Error ? error.message : String(error),
      dateRecord,
      startDate,
      endDate,
      limit
    });
    // Return empty array instead of throwing to prevent UI breakage
    return [];
  }
}
