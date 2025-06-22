import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

type AddNoteScreenProps = {
  navigation: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleSaveNote = () => {
    console.log('Başlık:', title);
    console.log('İçerik:', content);
    // Burada not kaydetme işlemleri yapılacak
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
          title="Notu Kaydet"
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

export default AddNoteScreen; 