import React, { useState, useLayoutEffect, useContext } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  Text,
  Alert,
  Keyboard,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ThemeContext } from '../App';
import { NotesService } from '../utils/storage';

type AddNoteScreenProps = NativeStackScreenProps<RootStackParamList, 'AddNote'>;

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Animation values
  const titleOpacity = new Animated.Value(0);
  const contentOpacity = new Animated.Value(0);
  
  // Start animations when component mounts
  React.useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={saveNote}
          style={({ pressed }) => [
            styles.saveButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      ),
      headerStyle: {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      },
      headerTitleStyle: {
        color: isDarkMode ? '#ffffff' : '#000000',
      },
      headerTintColor: isDarkMode ? '#ffffff' : '#000000',
    });
  }, [navigation, title, content, isSaving, isDarkMode]);

  const saveNote = async () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }
    
    try {
      setIsSaving(true);
      Keyboard.dismiss();
      
      // Save the note using the NotesService
      const newNote = await NotesService.addNote(title.trim(), content.trim());
      
      if (newNote) {
        // Navigate back to home screen
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save note');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
      setIsSaving(false);
    }
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      {isSaving ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#007AFF"} />
          <Text style={[
            styles.loadingText,
            isDarkMode && styles.loadingTextDark
          ]}>
            Saving note...
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          enabled
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: titleOpacity }}>
              <TextInput
                style={[
                  styles.titleInput,
                  isDarkMode && styles.titleInputDark
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
                autoFocus
              />
            </Animated.View>
            
            <Animated.View style={[
              styles.contentContainer,
              { opacity: contentOpacity }
            ]}>
              <TextInput
                style={[
                  styles.contentInput,
                  isDarkMode && styles.contentInputDark
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="Write your note here..."
                placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
                multiline
                textAlignVertical="top"
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
    minHeight: '100%',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleInputDark: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    minHeight: 300,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    color: '#000',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentInputDark: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
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
});

export default AddNoteScreen; 