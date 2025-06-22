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

type AddNoteScreenProps = NativeStackScreenProps<RootStackParamList, 'AddNote'>;

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

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

    // Create a new note
    const newNote: Note = {
      id: Date.now().toString(), // Simple unique ID generation
      title: title.trim(),
      content: content.trim()
    };

    // Log the note for debugging
    console.log('Title:', newNote.title);
    console.log('Content:', newNote.content);

    // Reset navigation to Home to avoid back button
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: 'Home', 
          params: { newNote }
        }
      ],
    });
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
          title="Save Note"
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

export default AddNoteScreen; 