import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (text: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchText, setSearchText] = useState<string>('');

  const handleSearch = () => {
    onSearch(searchText);
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
      />
      {searchText.length > 0 ? (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name="close-circle" size={24} color="#888" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    padding: 5,
  },
  clearButton: {
    padding: 5,
  },
});
