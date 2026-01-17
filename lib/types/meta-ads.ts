/**
 * Meta Ads Types
 * Centralized type definitions for Meta/Facebook Ads tracking
 */

export interface AdsData {
  spend: number;
  impressions: number;
  inlineLinkClicks: number;
  reach: number;
  date_start?: string;
  date_end?: string;
  updated_at?: string;
}

export interface AdsLogEntry {
  /** Unique identifier */
  id: number;
  
  /** Date of the log entry */
  date_record: string;
  
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  
  /** When the entry was updated */
  updated_at: string;
}

export interface AdsInsights {
  /** Total spend across period */
  total_spend: number;
  
  /** Total impressions */
  total_impressions: number;
  
  /** Total clicks */
  total_clicks: number;
  
  /** Total reach */
  total_reach: number;
  
  /** Start date of insights */
  start_date: string;
  
  /** End date of insights */
  end_date: string;
}
