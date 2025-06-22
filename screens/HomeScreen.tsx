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
  Platform,
  Button
} from 'react-native';
import { 
  NativeStackNavigationProp, 
  NativeStackScreenProps 
} from '@react-navigation/native-stack';
import { 
  useFocusEffect 
} from '@react-navigation/native';
import { RootStackParamList, Note } from '../App';
import { saveNotesToFile, shareNotesFile } from '../utils/saveNotes';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to MyNotesApp',
      content: 'This is a simple note-taking app. You can add, edit, and delete notes.'
    }
  ]);

  // Handle backup of notes
  const handleBackupNotes = async () => {
    try {
      // First save the notes to a temporary file
      const saveResult = await saveNotesToFile(notes);
      
      if (saveResult.success && saveResult.path && saveResult.filename) {
        // Then prompt the user to select where to save the file
        const shareResult = await shareNotesFile(saveResult.path, saveResult.filename);
        
        if (shareResult.success) {
          console.log('Dosya başarıyla paylaşıldı');
        } else {
          Alert.alert(
            'Paylaşım Hatası',
            'Dosya paylaşılırken bir hata oluştu.',
            [{ text: 'Tamam', style: 'default' }]
          );
        }
      } else {
        Alert.alert(
          'Yedekleme Hatası',
          'Notlar kaydedilirken bir hata oluştu.',
          [{ text: 'Tamam', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Yedekleme işlemi hatası:', error);
      Alert.alert(
        'Yedekleme Hatası',
        'Notlar kaydedilirken bir hata oluştu.',
        [{ text: 'Tamam', style: 'default' }]
      );
    }
  };

  // Add the + button to the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={handleBackupNotes}
            style={({ pressed }) => [
              styles.backupButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={styles.backupButtonText}>💾</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('AddNote')}
            style={({ pressed }) => [
              styles.addButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, notes]);

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
      if (route.params?.updatedNote && route.params?.noteIndex !== undefined) {
        const { updatedNote, noteIndex } = route.params;
        setNotes(currentNotes => {
          const newNotes = [...currentNotes];
          newNotes[noteIndex] = updatedNote;
          return newNotes;
        });
        navigation.setParams({ updatedNote: undefined, noteIndex: undefined });
      }
      
      // Handle deleted note
      if (route.params?.deleteNoteId) {
        const deleteId = route.params.deleteNoteId;
        setNotes(currentNotes => currentNotes.filter(note => note.id !== deleteId));
        navigation.setParams({ deleteNoteId: undefined });
      }
    }, [route.params?.newNote, route.params?.updatedNote, route.params?.deleteNoteId])
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
          options: ['İptal', 'Düzenle', 'Sil'],
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
        'Not İşlemleri',
        `"${note.title}" için işlem seçin`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Düzenle', 
            onPress: () => navigation.navigate('EditNote', { note, noteIndex: index }) 
          },
          { 
            text: 'Sil', 
            onPress: () => confirmDelete(note),
            style: 'destructive'
          }
        ]
      );
    }
  };

  // Confirm note deletion
  const confirmDelete = (note: Note) => {
    Alert.alert(
      'Notu Sil',
      `"${note.title}" notunu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          onPress: () => {
            // Delete the note
            setNotes(currentNotes => currentNotes.filter(item => item.id !== note.id));
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
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz not eklenmemiş</Text>
          <Text style={styles.emptySubText}>Sağ üstteki + butonuna tıklayarak not ekleyebilirsiniz</Text>
        </View>
      )}
      
      <View style={styles.backupButtonContainer}>
        <Button 
          title="Notları Yedekle" 
          onPress={handleBackupNotes} 
          color="#007AFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  listContainer: {
    paddingBottom: 80, // Extra padding for the backup button
  },
  noteCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 28,
    textAlign: 'center',
  },
  backupButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backupButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  backupButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen; 