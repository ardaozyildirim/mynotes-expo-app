import React, { useState, useLayoutEffect, useCallback, useContext, useEffect, useRef } from 'react';
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
  StatusBar,
  Animated,
  ActivityIndicator
} from 'react-native';
import { 
  NativeStackNavigationProp, 
  NativeStackScreenProps 
} from '@react-navigation/native-stack';
import { 
  useFocusEffect 
} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ThemeContext } from '../App';
import { Note, NotesService } from '../utils/storage';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);

  // Fetch notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotes();
      return () => {
        // This will run when the screen loses focus
        firstRender.current = false;
      };
    }, [])
  );

  // Load notes from storage
  const loadNotes = async () => {
    try {
      setRefreshing(true);
      const storedNotes = await NotesService.getAllNotes();
      
      // Sort notes by updatedAt (newest first)
      storedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
      
      setNotes(storedNotes);
      
      // Start fade-in animation
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error('Failed to load notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const success = await NotesService.deleteNote(noteId);
      if (success) {
        // Remove note from state
        setNotes(currentNotes => currentNotes.filter(note => note.id !== noteId));
      } else {
        Alert.alert('Error', 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  // Navigate to settings screen
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Navigate to add note screen
  const navigateToAddNote = () => {
    navigation.navigate('AddNote');
  };

  // Add the header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={navigateToSettings}
            style={({ pressed }) => [
              styles.settingsButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons 
              name="settings-outline" 
              size={24} 
              color={isDarkMode ? "#fff" : "#000"} 
            />
          </Pressable>
          <Pressable
            onPress={navigateToAddNote}
            style={({ pressed }) => [
              styles.addButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
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
      headerShadowVisible: false,
    });
  }, [navigation, isDarkMode]);

  // Handle note press - navigate to detail view
  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', { noteId: note.id });
  };

  // Handle note long press - show edit/delete options
  const handleNoteLongPress = (note: Note) => {
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
            navigation.navigate('EditNote', { noteId: note.id });
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
            onPress: () => navigation.navigate('EditNote', { noteId: note.id }) 
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
          onPress: () => handleDeleteNote(note.id),
          style: 'destructive'
        }
      ]
    );
  };

  // Create animated note item component
  const AnimatedNoteItem = ({ item, index }: { item: Note, index: number }) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      // Stagger the animation based on item index
      const delay = index * 80;
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true
        })
      ]).start();
    }, []);
    
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }}
      >
        <TouchableOpacity 
          style={[
            styles.noteCard,
            isDarkMode && styles.noteCardDark
          ]}
          onPress={() => handleNotePress(item)}
          onLongPress={() => handleNoteLongPress(item)}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <View style={styles.noteCardContent}>
            <Text 
              style={[
                styles.noteTitle,
                isDarkMode && styles.noteTitleDark
              ]} 
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text 
              style={[
                styles.noteContent,
                isDarkMode && styles.noteContentDark
              ]} 
              numberOfLines={2}
            >
              {item.content}
            </Text>
          </View>
          <View style={styles.noteCardIcon}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#777" : "#bbb"} 
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Empty state when there are no notes
  const renderEmptyState = () => {
    if (notes.length === 0 && !isLoading) {
      return (
        <Animated.View 
          style={[
            styles.emptyStateContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Ionicons 
            name="document-text-outline" 
            size={70} 
            color={isDarkMode ? "#555" : "#ccc"} 
          />
          <Text style={[
            styles.emptyStateText,
            isDarkMode && styles.emptyStateTextDark
          ]}>
            No notes yet
          </Text>
          <Text style={[
            styles.emptyStateSubtext,
            isDarkMode && styles.emptyStateSubtextDark
          ]}>
            Tap the + button to create your first note
          </Text>
        </Animated.View>
      );
    }
    return null;
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
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {renderEmptyState()}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={notes}
          renderItem={({ item, index }) => (
            <AnimatedNoteItem item={item} index={index} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.notesList,
            notes.length === 0 && styles.emptyList
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadNotes}
          refreshing={refreshing}
        />
      </Animated.View>
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
  notesList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteCardDark: {
    backgroundColor: '#2a2a2a',
  },
  noteCardContent: {
    flex: 1,
  },
  noteCardIcon: {
    marginLeft: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000',
  },
  noteTitleDark: {
    color: '#fff',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noteContentDark: {
    color: '#bbb',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -2,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emptyStateContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  emptyStateTextDark: {
    color: '#aaa',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyStateSubtextDark: {
    color: '#777',
  },
});

export default HomeScreen; 