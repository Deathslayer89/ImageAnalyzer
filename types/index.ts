import { Database } from '@supabase/supabase-js';

/**
 * Image Analysis Result Types
 */
export interface ImageAnalysisResult {
  id: string;
  created_at: string;
  analysis: string;
  image_url: string;
  status: 'success' | 'error' | 'processing';
}

/**
 * Auth Form Data Type
 */
export interface AuthFormData {
  email: string;
  password: string;
}

/**
 * Time Filter Type
 */
export type TimeFilter = '3h' | '24h' | '7d' | 'all' | 'custom';

/**
 * Sort Order Type
 */
export type SortOrder = 'latest' | 'oldest';

/**
 * Custom Date Range Type
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}