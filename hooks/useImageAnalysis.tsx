import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import { supabase } from '@/lib/supabase';
import { analyzeImage } from '@/lib/gemini';
import { router } from 'expo-router';

export interface ImageAnalysisResult {
  id: string;
  created_at: string;
  analysis: string;
  image_url: string;
  status: 'success' | 'error' | 'processing';
}

export type TimeFilter = '3h' | '24h' | '7d' | 'all' | 'custom';
export type SortOrder = 'latest' | 'oldest';

export function useImageAnalysis() {
  const [results, setResults] = useState<ImageAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3h');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);

  // Upload image to Supabase storage
  const uploadImageToSupabase = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const imageData = toByteArray(base64);
      const filename = `image_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(filename, imageData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Analyze image and save results
  const analyzeAndSaveImage = async (uri: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Upload image to get a public URL
      const publicUrl = await uploadImageToSupabase(uri);
      
      // Create initial record with processing status
      const { data: initialData, error: initialError } = await supabase
        .from("image_analysis")
        .insert([
          {
            image_url: publicUrl,
            analysis: "Processing image...",
            status: "processing",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (initialError) throw initialError;
      
      try {
        // Perform analysis with Gemini AI
        const analysis = await analyzeImage(uri);
        
        // Update record with analysis results
        const { data, error } = await supabase
          .from("image_analysis")
          .update({
            analysis: analysis,
            status: "success",
          })
          .eq('id', initialData[0].id)
          .select();

        if (error) throw error;
        
        // Navigate to results screen
        router.push('/results');
        return data[0];
      } catch (analysisError) {
        // Update record with error status
        await supabase
          .from("image_analysis")
          .update({
            analysis: "Failed to analyze image",
            status: "error",
          })
          .eq('id', initialData[0].id);

        throw analysisError;
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch analysis results with filters
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('image_analysis')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'oldest' });

      // Apply time filters
      if (timeFilter !== 'all' && timeFilter !== 'custom') {
        const now = new Date();
        let hoursAgo: number;
        
        switch (timeFilter) {
          case '3h':
            hoursAgo = 3;
            break;
          case '24h':
            hoursAgo = 24;
            break;
          case '7d':
            hoursAgo = 24 * 7;
            break;
          default:
            hoursAgo = 3;
        }
        
        const startDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        query = query.gte('created_at', startDate.toISOString());
      } else if (timeFilter === 'custom' && customDateRange) {
        // Apply custom date range
        query = query
          .gte('created_at', customDateRange.startDate.toISOString())
          .lte('created_at', customDateRange.endDate.toISOString());
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch results');
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, sortOrder, customDateRange]);

  // Set custom date range and apply 'custom' filter
  const setDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ startDate, endDate });
    setTimeFilter('custom');
  };

  return {
    results,
    isLoading,
    error,
    timeFilter,
    sortOrder,
    customDateRange,
    setTimeFilter,
    setSortOrder,
    setDateRange,
    fetchResults,
    analyzeAndSaveImage,
  };
}