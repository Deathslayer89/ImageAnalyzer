// components/results/ResultDetail.tsx
import React, { forwardRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { Card } from '../ui/Card';
import { formatDate } from '@/lib/utils';
import { ImageAnalysisResult } from './ResultsList';

interface ResultDetailProps {
  result: ImageAnalysisResult;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

type ViewShotRef = React.ElementRef<typeof ViewShot>;

export const ResultDetail = forwardRef<ViewShotRef, ResultDetailProps>(
  ({ result, onClose, onNext, onPrevious, hasNext, hasPrevious }, ref) => {
    const [isSharing, setIsSharing] = useState(false);
    
    const handleShare = () => {
      if (!ref || typeof ref === 'function' || isSharing) return;
      
      setIsSharing(true);
      
      // Use promise pattern instead of async/await
      ref.current?.capture()
        .then(uri => {
          if (uri) {
            return Sharing.shareAsync(uri, {
              mimeType: 'image/png',
              dialogTitle: 'Share Analysis',
            });
          }
        })
        .catch(error => {
          console.error('Error sharing result:', error);
        })
        .finally(() => {
          setIsSharing(false);
        });
    };

    return (
      <Card className="w-full max-h-5/6">
        <TouchableOpacity
          onPress={onClose}
          className="absolute right-3 top-3 z-10 p-1"
        >
          <Ionicons name="close-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <ViewShot
          ref={ref}
          options={{ format: 'png', quality: 0.9 }}
        >
          <View className="p-4 bg-gray-800 rounded-lg">
            <Text className="text-gray-400 text-sm mb-3">
              {formatDate(result.created_at)}
            </Text>
            
            <View className="flex-row">
              {hasPrevious && (
                <TouchableOpacity 
                  onPress={onPrevious}
                  className="bg-gray-700 rounded-full p-2 absolute left-0 top-1/2 z-10"
                  style={{ transform: [{ translateY: -16 }] }}
                >
                  <Ionicons name="chevron-back-outline" size={24} color="white" />
                </TouchableOpacity>
              )}
              
              <View className="flex-1">
                <Image
                  source={{ uri: result.image_url }}
                  className="w-full h-56 rounded-lg"
                  resizeMode="cover"
                />
                
                <View className="mt-4">
                  <Text className="text-white text-base">
                    {result.status === 'error'
                      ? 'Failed to analyze image. Please try again.'
                      : result.analysis}
                  </Text>
                </View>
              </View>
              
              {hasNext && (
                <TouchableOpacity 
                  onPress={onNext}
                  className="bg-gray-700 rounded-full p-2 absolute right-0 top-1/2 z-10"
                  style={{ transform: [{ translateY: -16 }] }}
                >
                  <Ionicons name="chevron-forward-outline" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ViewShot>
        
        <TouchableOpacity
          onPress={handleShare}
          disabled={isSharing}
          className="flex-row items-center justify-center bg-blue-600 p-3 mt-4 rounded-md mx-4 mb-4"
        >
          <Ionicons name="share-outline" size={18} color="white" />
          <Text className="text-white font-medium ml-2">
            {isSharing ? 'Sharing...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  }
);

ResultDetail.displayName = 'ResultDetail';