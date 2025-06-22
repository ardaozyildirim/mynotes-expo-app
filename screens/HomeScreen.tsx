import React, { useState, useLayoutEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { 
  NativeStackNavigationProp, 
  NativeStackScreenProps 
} from '@react-navigation/native-stack';
import { 
  useFocusEffect 
} from '@react-navigation/native';
import { RootStackParamList, Note } from '../App';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to MyNotesApp',
      content: 'This is a simple note-taking app. You can add, edit, and delete notes.'
    }
  ]);

  // Add the + button to the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('AddNote')}
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      ),
    });
  }, [navigation, notes]);

  // Find note index by ID
  const findNoteIndexById = (noteId: string): number => {
    return notes.findIndex(note => note.id === noteId);
  };

  // Check for new notes, updated notes, or deleted notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Handle new note
      if (route.params?.newNote) {
        const newNote = route.params.newNote;
        setNotes(currentNotes => [...currentNotes, newNote]);
        navigation.setParams({ newNote: undefined });
      }
      
      // Handle updated note
      if (route.params?.updatedNote) {
        const { updatedNote, noteIndex, fromNoteDetail } = route.params;
        
        // If coming from NoteDetail, we need to find the note by ID
        if (fromNoteDetail && noteIndex === -1) {
          const foundIndex = findNoteIndexById(updatedNote.id);
          if (foundIndex !== -1) {
            setNotes(currentNotes => {
              const newNotes = [...currentNotes];
              newNotes[foundIndex] = updatedNote;
              return newNotes;
            });
          }
        } 
        // Standard update with known index
        else if (noteIndex !== undefined && noteIndex >= 0) {
          setNotes(currentNotes => {
            const newNotes = [...currentNotes];
            newNotes[noteIndex] = updatedNote;
            return newNotes;
          });
        }
        
        // Clear the params
        navigation.setParams({ 
          updatedNote: undefined, 
          noteIndex: undefined,
          fromNoteDetail: undefined 
        });
      }
      
      // Handle deleted note
      if (route.params?.deleteNoteId) {
        const deleteId = route.params.deleteNoteId;
        setNotes(currentNotes => currentNotes.filter(note => note.id !== deleteId));
        navigation.setParams({ deleteNoteId: undefined });
      }
    }, [route.params?.newNote, route.params?.updatedNote, route.params?.deleteNoteId, route.params?.fromNoteDetail])
  );

  // Handle note press - navigate to detail view
  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', { note });
  };

  // Handle note long press - show edit/delete options
  const handleNoteLongPress = (note: Note, index: number) => {
    if (Platform.OS === 'ios') {
      // For iOS, use ActionSheetIOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
          title: note.title
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Edit
            navigation.navigate('EditNote', { note, noteIndex: index });
          } else if (buttonIndex === 2) {
            // Delete
            confirmDelete(note);
          }
        }
      );
    } else {
      // For Android, use Alert with buttons
      Alert.alert(
        'Note Actions',
        `Select an action for "${note.title}"`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Edit', 
            onPress: () => navigation.navigate('EditNote', { note, noteIndex: index }) 
          },
          { 
            text: 'Delete', 
            onPress: () => confirmDelete(note),
            style: 'destructive'
          }
        ]
      );
    }
  };

  // Confirm deletion of a note
  const confirmDelete = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            // Delete the note and navigate back to home
            navigation.setParams({ deleteNoteId: note.id });
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Render each note item
  const renderNoteItem = ({ item, index }: { item: Note, index: number }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleNoteLongPress(item, index)}
      delayLongPress={500}
    >
      <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notesList: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteContent: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backupButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default HomeScreen; 