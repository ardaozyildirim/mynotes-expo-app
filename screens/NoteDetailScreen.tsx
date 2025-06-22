import React, { useLayoutEffect, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Pressable
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Note } from '../App';

type NoteDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen: React.FC<NoteDetailScreenProps> = ({ route, navigation }) => {
  // Use local state to track the note so we can update it
  const [currentNote, setCurrentNote] = useState<Note>(route.params.note);

  // Update the local note when the route params change
  useEffect(() => {
    if (route.params.note) {
      setCurrentNote(route.params.note);
    }
  }, [route.params.note]);

  // Add an edit button to the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => handleEditNote()}
          style={({ pressed }) => [
            styles.editButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      ),
      // Set the title to the note title
      title: currentNote.title.length > 20 
        ? currentNote.title.substring(0, 20) + '...' 
        : currentNote.title
    });
  }, [navigation, currentNote]);

  // Handle edit button press
  const handleEditNote = () => {
    // Navigate to the EditNote screen with the note and a special flag
    navigation.navigate('EditNote', { 
      note: currentNote, 
      noteIndex: -1, // Special value indicating we need to find the index in HomeScreen
      fromNoteDetail: true // Flag to indicate we came from NoteDetail
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{currentNote.title}</Text>
        <Text style={styles.content}>{currentNote.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NoteDetailScreen; 