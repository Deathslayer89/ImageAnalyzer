import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ViewShot from 'react-native-view-shot';

import {
  ResultsList,
  ImageAnalysisResult,
} from '@/components/results/ResultsList';
import {
  ResultsFilters,
  TimeFilter,
  SortOrder,
} from '@/components/results/ResultsFilters';
import { ResultDetail } from '@/components/results/ResultDetail';
import { DateRangePicker } from '@/components/results/DateRangePicker';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { SearchBar } from '@/components/ui/SearchBar'; // Import the SearchBar component
import { useAuth } from '@/context/AuthContext';

export default function ResultsScreen() {
  const user = useAuth();

  const {
    results,
    isLoading,
    error,
    timeFilter,
    sortOrder,
    setTimeFilter,
    setSortOrder,
    setDateRange,
    fetchResults,
  } = useImageAnalysis(user);

  const [selectedResult, setSelectedResult] =
    useState<ImageAnalysisResult | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [customFilterModalVisible, setCustomFilterModalVisible] =
    useState(false);
  const [customFilterActive, setCustomFilterActive] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  ); // 24 hours ago
  const [endDate, setEndDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state

  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (user) {
      fetchResults('');
    }
  }, [user, fetchResults]);
  
  useEffect(() => {
    fetchResults(searchQuery); // Pass searchQuery to fetchResults
  }, [fetchResults, timeFilter, sortOrder, customFilterActive, searchQuery]);

  const handleSelectResult = (result: ImageAnalysisResult) => {
    setSelectedResult(result);
    setDetailModalVisible(true);
  };

  const handleNextResult = () => {
    if (!selectedResult) return;

    const currentIndex = results.findIndex((r) => r.id === selectedResult.id);
    if (currentIndex > 0) {
      setSelectedResult(results[currentIndex - 1]);
    }
  };

  const handlePreviousResult = () => {
    if (!selectedResult) return;

    const currentIndex = results.findIndex((r) => r.id === selectedResult.id);
    if (currentIndex < results.length - 1) {
      setSelectedResult(results[currentIndex + 1]);
    }
  };

  const handleOpenCustomFilter = () => {
    setCustomFilterModalVisible(true);
  };

  const handleApplyCustomFilter = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
    setCustomFilterActive(true);
    setDateRange(startDate, endDate);
    setCustomFilterModalVisible(false);
  };

  const handleCloseCustomFilter = () => {
    setCustomFilterModalVisible(false);
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    if (filter !== 'custom') {
      setCustomFilterActive(false);
    }
    setTimeFilter(filter);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <SearchBar onSearch={handleSearch} />
      <ResultsFilters
        timeFilter={timeFilter}
        sortOrder={sortOrder}
        onTimeFilterChange={handleTimeFilterChange}
        onSortOrderChange={setSortOrder}
        onOpenCustomFilter={handleOpenCustomFilter}
        customFilterActive={customFilterActive}
      />
      <ResultsList
        results={results}
        isLoading={isLoading}
        onRefresh={fetchResults}
        onSelectResult={handleSelectResult}
      />

      {/* Result Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          {selectedResult && (
            <ResultDetail
              ref={viewShotRef}
              result={selectedResult}
              onClose={() => setDetailModalVisible(false)}
              onNext={handleNextResult}
              onPrevious={handlePreviousResult}
              hasNext={
                selectedResult &&
                results.findIndex((r) => r.id === selectedResult.id) > 0
              }
              hasPrevious={
                selectedResult &&
                results.findIndex((r) => r.id === selectedResult.id) <
                  results.length - 1
              }
            />
          )}
        </View>
      </Modal>

      {/* Custom Date Filter Modal */}
      <Modal
        visible={customFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseCustomFilter}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onApply={handleApplyCustomFilter}
            onClose={handleCloseCustomFilter}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
