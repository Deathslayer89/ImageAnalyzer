import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { format, subHours } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

// Enhanced type for a single result item
interface ImageAnalysisResult {
  id: string;
  created_at: string;
  analysis: string;
  image_url: string;
  status: 'success' | 'error' | 'processing';
}

type TimeFilter = '3h' | '24h' | '7d' | 'all';

export default function ResultsScreen() {
  const [results, setResults] = useState<ImageAnalysisResult[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3h');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [timeFilter]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('image_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (timeFilter !== 'all') {
        const hours = timeFilter === '3h' ? 3 : timeFilter === '24h' ? 24 : 168;
        query = query.gte('created_at', subHours(new Date(), hours).toISOString());
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        throw error;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ImageAnalysisResult['status']) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="alert-circle" size={20} color="#F44336" />;
      case 'processing':
        return <Ionicons name="time" size={20} color="#FFC107" />;
      default:
        return null;
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
      default:
        return '';
    }
  };

  const renderItem = ({ item }: { item: ImageAnalysisResult }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Text style={styles.timestamp}>
          {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {(['3h', '24h', '7d', 'all'] as TimeFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              timeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setTimeFilter(filter)}
          >
            <Text style={styles.filterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
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
  },
  filterButton: {
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: '#333',
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
  statussuccess: {
    color: '#4CAF50',
  },
  statuserror: {
    color: '#F44336',
  },
  statusprocessing: {
    color: '#FFC107',
  },
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
});