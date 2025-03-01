// hooks/useImageAnalysis.tsx
import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import { supabase } from '@/lib/supabase';
import { analyzeImage } from '@/lib/gemini';
import { router } from 'expo-router';
import { User } from '@supabase/supabase-js';
import { sub } from 'date-fns';

export interface ImageAnalysisResult {
  id: string;
  created_at: string;
  analysis: string;
  image_url: string;
  status: 'success' | 'error' | 'processing';
}

export type TimeFilter = '3h' | '24h' | '7d' | 'all' | 'custom';
export type SortOrder = 'latest' | 'oldest';

export function useImageAnalysis(user: User | null = null) {
  const [results, setResults] = useState<ImageAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3h');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [customFilterActive, setCustomFilterActive] = useState(false);

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
            user_id: user?.id,
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
  const fetchResults = useCallback(
    async (searchQuery: string = '') => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('image_analysis')
        .select('*')
        .eq('user_id', user.id);

      if (searchQuery) {
        // If there's a search query, bypass filters and search analysis field
        query = query.ilike('analysis', `%${searchQuery}%`);
      } else {
        // Apply time filter
        if (timeFilter !== 'all' && timeFilter !== 'custom') {
          const fromDate = sub(new Date(), {
            hours: timeFilter === '3h' ? 3 : 0,
            days: timeFilter === '24h' ? 1 : timeFilter === '7d' ? 7 : 0,
          });
          query = query.gte('created_at', fromDate.toISOString());
        }

        // Apply custom date range
        if (customFilterActive && dateRange) {
          query = query.gte('created_at', dateRange.startDate.toISOString());
          query = query.lte('created_at', dateRange.endDate.toISOString());
        }

        // Apply sort order
        query = query.order('created_at', { ascending: sortOrder === 'oldest' });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching results:', error);
        setError(error.message);
      } else {
        setResults(data || []);
      }

      setIsLoading(false);
    },
    [user, timeFilter, sortOrder, customFilterActive, dateRange]
  );

  // Set custom date range and activate custom filter
  const handleSetDateRange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    setTimeFilter('custom');
    setCustomFilterActive(true);
  };

  return {
    results,
    isLoading,
    error,
    timeFilter,
    sortOrder,
    dateRange,
    customFilterActive,
    setTimeFilter,
    setSortOrder,
    setDateRange: handleSetDateRange,
    fetchResults,
    analyzeAndSaveImage,
  };
}