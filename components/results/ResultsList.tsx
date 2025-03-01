import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatDate } from '@/lib/utils';
import { Card } from '../ui/Card';

export interface ImageAnalysisResult {
  id: string;
  created_at: string;
  analysis: string;
  image_url: string;
  status: 'success' | 'error' | 'processing';
}

interface ResultsListProps {
  results: ImageAnalysisResult[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectResult: (result: ImageAnalysisResult) => void;
}

export function ResultsList({ 
  results, 
  isLoading, 
  onRefresh, 
  onSelectResult 
}: ResultsListProps) {
  const getStatusIcon = (status: ImageAnalysisResult['status']) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle-outline" size={18} color="#4ade80" />;
      case 'error':
        return <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />;
      case 'processing':
        return <Ionicons name="time-outline" size={18} color="#f59e0b" />;
    }
  };

  const getStatusText = (status: ImageAnalysisResult['status']) => {
    switch (status) {
      case 'success':
        return 'Analysis completed';
      case 'error':
        return 'Analysis failed';
      case 'processing':
        return 'Processing...';
    }
  };

  const getStatusColor = (status: ImageAnalysisResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'processing':
        return 'text-yellow-500';
    }
  };

  const renderItem = ({ item }: { item: ImageAnalysisResult }) => (
    <TouchableOpacity 
      onPress={() => onSelectResult(item)}
      className="mb-3"
    >
      <Card>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400 text-xs">
              {formatDate(item.created_at)}
            </Text>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className={`ml-1 text-xs ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          <Text 
            className="text-white" 
            numberOfLines={3}
          >
            {item.status === 'error' 
              ? 'Failed to analyze image. Please try again.' 
              : item.analysis}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && results.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-400 mt-4">Loading results...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerClassName="p-4"
      onRefresh={onRefresh}
      refreshing={isLoading}
      ListEmptyComponent={
        <View className="items-center justify-center py-10">
          <Text className="text-gray-400 text-center">No results found</Text>
          <Text className="text-gray-500 text-center text-xs mt-1">
            Take a photo to analyze it with AI
          </Text>
        </View>
      }
    />
  );
}