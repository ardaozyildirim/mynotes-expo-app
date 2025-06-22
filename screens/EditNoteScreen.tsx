import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Note } from '../App';

type EditNoteScreenProps = NativeStackScreenProps<RootStackParamList, 'EditNote'>;

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({ navigation, route }) => {
  const { note, noteIndex, fromNoteDetail } = route.params;
  
  const [title, setTitle] = useState<string>(note.title);
  const [content, setContent] = useState<string>(note.content);

  const handleSaveNote = () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content.');
      return;
    }

    // Create updated note
    const updatedNote: Note = {
      ...note,
      title: title.trim(),
      content: content.trim()
    };

    if (fromNoteDetail) {
      // If coming from NoteDetailScreen, we need to:
      // 1. Navigate back to the detail screen with the updated note
      // 2. Also update the note in the Home screen
      navigation.navigate('NoteDetail', { note: updatedNote });
      
      // Also update in HomeScreen (the index will be found there)
      navigation.navigate('Home', { updatedNote, noteIndex: -1, fromNoteDetail: true });
    } else {
      // Reset the navigation stack to Home to avoid back button
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'Home', 
            params: { updatedNote, noteIndex }
          }
        ],
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter note title"
        />
        
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter note content"
          multiline
          textAlignVertical="top"
        />
        
        <Button
          title="Save Changes"
          onPress={handleSaveNote}
          color="#007AFF"
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    height: 50,
  },
  contentInput: {
    height: 300,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
});

export default EditNoteScreen; 