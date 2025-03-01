import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { formatDate } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onApply: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}

export function DateRangePicker({
  startDate: initialStartDate,
  endDate: initialEndDate,
  onApply,
  onClose,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) {
      setEndDate(date);
    }
  };

  const handleApply = () => {
    onApply(startDate, endDate);
  };

  const isValidRange = startDate <= endDate;

  return (
    <Card className="w-5/6 max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Custom Date Range</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <View className="space-y-2">
          <Text className="text-white text-sm">Start Date</Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            className="bg-gray-700 rounded-md p-3 flex-row items-center"
          >
            <Ionicons name="calendar-outline" size={16} color="#d1d5db" />
            <Text className="text-white ml-2">
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="space-y-2">
          <Text className="text-white text-sm">End Date</Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            className="bg-gray-700 rounded-md p-3 flex-row items-center"
          >
            <Ionicons name="calendar-outline" size={16} color="#d1d5db" />
            <Text className="text-white ml-2">
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>
        
        {!isValidRange && (
          <Text className="text-red-500 text-xs">
            End date must be after start date
          </Text>
        )}
        
        {(showStartPicker || showEndPicker) && Platform.OS === 'ios' && (
          <View className="bg-gray-800 rounded-md p-3">
            <DateTimePicker
              value={showStartPicker ? startDate : endDate}
              mode="date"
              display="spinner"
              onChange={showStartPicker ? handleStartDateChange : handleEndDateChange}
              maximumDate={new Date()}
              textColor="white"
            />
          </View>
        )}
        
        {Platform.OS === 'android' && showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}
        
        {Platform.OS === 'android' && showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            maximumDate={new Date()}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex-row space-x-3">
        <Button 
          variant="ghost" 
          className="flex-1" 
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="flex-1" 
          onPress={handleApply}
          disabled={!isValidRange}
        >
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
}