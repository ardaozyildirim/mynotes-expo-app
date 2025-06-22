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
  ActivityIndicator,
  SafeAreaView
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

  if (isSaving) {
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
          Saving note...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <View style={styles.inputContainer}>
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
      </View>
    </SafeAreaView>
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
  inputContainer: {
    flex: 1,
    padding: 20,
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