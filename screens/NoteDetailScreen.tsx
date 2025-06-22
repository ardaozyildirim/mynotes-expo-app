import React, { useLayoutEffect, useContext, useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Share,
  Alert,
  Animated,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ThemeContext } from '../App';
import { Note, NotesService } from '../utils/storage';

type NoteDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen: React.FC<NoteDetailScreenProps> = ({ navigation, route }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { noteId } = route.params;
  
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load note data when component mounts
  useEffect(() => {
    const loadNote = async () => {
      try {
        const fetchedNote = await NotesService.getNoteById(noteId);
        if (fetchedNote) {
          setNote(fetchedNote);
          
          // Run animations
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            })
          ]).start();
        } else {
          Alert.alert('Error', 'Note not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading note:', error);
        Alert.alert('Error', 'Failed to load note');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNote();
  }, [noteId]);

  // Set up header options with edit and share buttons
  useLayoutEffect(() => {
    if (!note) return;
    
    navigation.setOptions({
      title: note.title.length > 20 ? note.title.substring(0, 20) + '...' : note.title,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons 
              name="share-outline" 
              size={24} 
              color={isDarkMode ? "#fff" : "#000"} 
            />
          </Pressable>
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons 
              name="create-outline" 
              size={24} 
              color={isDarkMode ? "#fff" : "#000"} 
            />
          </Pressable>
        </View>
      ),
      headerStyle: {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      },
      headerTitleStyle: {
        color: isDarkMode ? '#ffffff' : '#000000',
        fontWeight: 'bold',
      },
      headerTintColor: isDarkMode ? '#ffffff' : '#000000',
    });
  }, [navigation, note, isDarkMode]);

  // Handle sharing the note
  const handleShare = async () => {
    if (!note) return;
    
    try {
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
    }
  };

  // Navigate to edit screen
  const handleEdit = () => {
    if (!note) return;
    navigation.navigate('EditNote', { noteId: note.id });
  };

  // Handle note deletion
  const handleDelete = async () => {
    if (!note) return;
    
    try {
      const success = await NotesService.deleteNote(note.id);
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (!note) return;
    
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: handleDelete,
          style: 'destructive'
        }
      ]
    );
  };

  // Loading indicator
  if (isLoading) {
    return (
      <View style={[
        styles.container, 
        styles.loadingContainer,
        isDarkMode && styles.containerDark
      ]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#007AFF"} />
        <Text style={[
          styles.loadingText,
          isDarkMode && styles.loadingTextDark
        ]}>
          Loading note...
        </Text>
      </View>
    );
  }

  // Format content with paragraph breaks
  const formattedContent = note?.content.replace(/\n/g, '\n\n') || '';

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <Text style={[
            styles.title,
            isDarkMode && styles.titleDark
          ]}>
            {note?.title}
          </Text>
          
          <Text style={[
            styles.content,
            isDarkMode && styles.contentDark
          ]}>
            {formattedContent}
          </Text>
          
          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.deleteButtonText}>Delete Note</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  loadingTextDark: {
    color: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 30,
  },
  contentDark: {
    color: '#ddd',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default NoteDetailScreen; 