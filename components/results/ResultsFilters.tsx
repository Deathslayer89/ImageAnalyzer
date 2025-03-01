import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/utils';

export type TimeFilter = '3h' | '24h' | '7d' | 'custom';
export type SortOrder = 'latest' | 'oldest';

interface ResultsFiltersProps {
  timeFilter: TimeFilter;
  sortOrder: SortOrder;
  onTimeFilterChange: (filter: TimeFilter) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onOpenCustomFilter: () => void;
  customFilterActive?: boolean;
}

export function ResultsFilters({
  timeFilter,
  sortOrder,
  onTimeFilterChange,
  onSortOrderChange,
  onOpenCustomFilter,
  customFilterActive = false,
}: ResultsFiltersProps) {
  const timeFilterOptions: { value: TimeFilter; label: string }[] = [
    { value: '3h', label: '3h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
  ];

  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === 'latest' ? 'oldest' : 'latest');
  };

  return (
    <View className="bg-gray-900 p-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-x-3"
      >
        {timeFilterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onTimeFilterChange(option.value)}
            className={cn(
              "px-4 py-2.5 rounded-lg",
              timeFilter === option.value && !customFilterActive
                ? "bg-blue-600"
                : "bg-gray-800"
            )}
          >
            <Text className={cn(
              "text-sm font-medium",
              timeFilter === option.value && !customFilterActive
                ? "text-white"
                : "text-gray-300"
            )}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={onOpenCustomFilter}
          className={cn(
            "px-4 py-2.5 rounded-lg flex-row items-center",
            customFilterActive ? "bg-blue-600" : "bg-gray-800"
          )}
        >
          <Ionicons name="calendar-outline" size={16} color={customFilterActive ? "white" : "#d1d5db"} />
          {/* <Text className={cn(
            "text-sm ml-2 font-medium",
            customFilterActive ? "text-white" : "text-gray-300"
          )}>
          </Text> */}
        </TouchableOpacity>

        <View className="h-6 border-l border-gray-700 mx-2" />

        <TouchableOpacity
          onPress={toggleSortOrder}
          className="px-4 py-2.5 rounded-lg bg-gray-800 flex-row items-center"
        >
          {sortOrder === 'latest' ? (
            <>
              <Ionicons name="arrow-down-outline" size={16} color="#d1d5db" />
              <Text className="text-sm ml-2 text-gray-300">Latest</Text>
            </>
          ) : (
            <>
              <Ionicons name="arrow-up-outline" size={16} color="#d1d5db" />
              <Text className="text-sm ml-2 text-gray-300">Oldest</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
