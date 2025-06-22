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
  const { note, noteIndex } = route.params;
  
  const [title, setTitle] = useState<string>(note.title);
  const [content, setContent] = useState<string>(note.content);

  const handleSaveNote = () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen bir başlık girin.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Hata', 'Lütfen not içeriğini girin.');
      return;
    }

    // Create updated note
    const updatedNote: Note = {
      ...note,
      title: title.trim(),
      content: content.trim()
    };

    // Navigate back to Home screen with the updated note
    navigation.navigate('Home', { updatedNote, noteIndex });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.label}>Başlık</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Not başlığını girin"
        />
        
        <Text style={styles.label}>İçerik</Text>
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          placeholder="Not içeriğini girin"
          multiline
          textAlignVertical="top"
        />
        
        <Button
          title="Değişiklikleri Kaydet"
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
  },
  contentInput: {
    height: 150,
    marginBottom: 20,
  },
});

export default EditNoteScreen; 