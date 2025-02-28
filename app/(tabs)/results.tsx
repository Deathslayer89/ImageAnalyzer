import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Image, Platform } from 'react-native';
import { format, subHours } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface ImageAnalysisResult {
  id: string;
  created_at: string;
  analysis: string;
  image_url: string;
  status: 'success' | 'error' | 'processing';
}

type TimeFilter = '3h' | '24h' | '7d' | 'all' | 'custom';
type SortOrder = 'latest' | 'oldest';

export default function ResultsScreen() {
  const [results, setResults] = useState<ImageAnalysisResult[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3h');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ImageAnalysisResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [customFilterApplied, setCustomFilterApplied] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    fetchResults();
  }, [timeFilter, sortOrder, customFilterApplied]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('image_analysis')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'oldest' });

      if (timeFilter !== 'all' && timeFilter !== 'custom') {
        const hours = timeFilter === '3h' ? 3 : timeFilter === '24h' ? 24 : 168;
        query = query.gte('created_at', subHours(new Date(), hours).toISOString());
      } else if (timeFilter === 'custom' && startDate && endDate) {
        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ImageAnalysisResult['status']) => {
    switch (status) {
      case 'success': return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case 'error': return <Ionicons name="alert-circle" size={20} color="#F44336" />;
      case 'processing': return <Ionicons name="time" size={20} color="#FFC107" />;
      default: return null;
    }
  };

  const getStatusText = (status: ImageAnalysisResult['status']) => {
    switch (status) {
      case 'success': return 'Analysis completed';
      case 'error': return 'Analysis failed';
      case 'processing': return 'Processing...';
      default: return '';
    }
  };

  const renderItem = ({ item }: { item: ImageAnalysisResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => {
        setSelectedResult(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.timestamp}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, styles[`status${item.status}`]]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.analysis}>
        {item.status === 'error' ? 'Failed to analyze image. Please try again.' : item.analysis}
      </Text>
    </TouchableOpacity>
  );

  const handleNext = () => {
    if (!selectedResult || !results.length) return;
    const currentIndex = results.findIndex((r) => r.id === selectedResult.id);
    if (currentIndex > 0) setSelectedResult(results[currentIndex - 1]);
  };

  const handlePrevious = () => {
    if (!selectedResult || !results.length) return;
    const currentIndex = results.findIndex((r) => r.id === selectedResult.id);
    if (currentIndex < results.length - 1) setSelectedResult(results[currentIndex + 1]);
  };

  const shareCard = async () => {
    if (!viewShotRef.current) return;
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Analysis',
      });
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        {selectedResult && (
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={styles.leftButton}
                  onPress={handlePrevious}
                  disabled={!results.length || results.findIndex((r) => r.id === selectedResult.id) === results.length - 1}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.centerContent}>
                  <Image
                    source={{ uri: selectedResult.image_url }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardAnalysis}>
                    {selectedResult.status === 'error'
                      ? 'Failed to analyze image. Please try again.'
                      : selectedResult.analysis}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.rightButton}
                  onPress={handleNext}
                  disabled={!results.length || results.findIndex((r) => r.id === selectedResult.id) === 0}
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={shareCard}>
                <Ionicons name="share-social" size={24} color="#fff" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </ViewShot>
        )}
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Custom Date Range</Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateInput}>{format(startDate, 'yyyy-MM-dd')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateInput}>{format(endDate, 'yyyy-MM-dd')}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              mode="date"
              value={startDate}
              display="spinner"
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              mode="date"
              value={endDate}
              display="spinner"
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
            />
          )}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              if (startDate && endDate) {
                setTimeFilter('custom');
                setCustomFilterApplied(true);
                setFilterModalVisible(false);
              }
            }}
            disabled={!startDate || !endDate}
          >
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={sortModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSortModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sortCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSortModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.sortTitle}>Sort By</Text>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => { setSortOrder('latest'); setSortModalVisible(false); }}
          >
            <Text style={styles.sortOptionText}>Latest</Text>
            {sortOrder === 'latest' && <Ionicons name="checkmark" size={20} color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => { setSortOrder('oldest'); setSortModalVisible(false); }}
          >
            <Text style={styles.sortOptionText}>Oldest</Text>
            {sortOrder === 'oldest' && <Ionicons name="checkmark" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {(['3h', '24h', '7d', 'all'] as TimeFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, timeFilter === filter && styles.filterButtonActive]}
            onPress={() => { setTimeFilter(filter); setCustomFilterApplied(false); }}
          >
            <Text style={styles.filterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'custom' && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical" size={20} color="#fff" />
          <Text style={styles.filterText}>{sortOrder}</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={24} color="#666" />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchResults}
          refreshing={isLoading}
        />
      )}
      {renderModal()}
      {renderFilterModal()}
      {renderSortModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1a1a1a',
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  filterButtonActive: {
    backgroundColor: '#666',
  },
  filterText: {
    color: 'white',
  },
  listContent: {
    padding: 10,
  },
  resultItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statussuccess: { color: '#4CAF50' },
  statuserror: { color: '#F44336' },
  statusprocessing: { color: '#FFC107' },
  analysis: {
    color: 'white',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  leftButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  rightButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cardImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
  },
  cardAnalysis: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2563eb',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  filterCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  filterTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  dateInput: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 10,
    color: 'white',
    width: '100%',
    marginBottom: 15,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
  },
  sortCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '60%',
    alignItems: 'center',
  },
  sortTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sortOptionText: {
    color: 'white',
    fontSize: 16,
  },
});