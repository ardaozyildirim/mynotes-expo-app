import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Note } from '../App';

// Extended note type with date
type NoteWithDate = Note & {
  date: string;
};

type NotesListScreenProps = NativeStackScreenProps<RootStackParamList, 'NotesList'>;

const NotesListScreen: React.FC<NotesListScreenProps> = ({ navigation }) => {
  // Dummy notes data
  const dummyNotes: NoteWithDate[] = [
    {
      id: '1',
      title: 'Alışveriş Listesi',
      content: 'Ekmek, süt, yumurta, peynir, meyve almayı unutma.',
      date: '10 Haziran 2023'
    },
    {
      id: '2',
      title: 'Toplantı Notları',
      content: 'Pazartesi günü saat 14:00\'da proje toplantısı var. Sunum hazırlamayı unutma.',
      date: '15 Haziran 2023'
    },
    {
      id: '3',
      title: 'Kitap Önerileri',
      content: 'Sapiens, Atomic Habits, Deep Work, The Psychology of Money.',
      date: '20 Haziran 2023'
    }
  ];

  // Render each note item
  const renderNoteItem = ({ item }: { item: NoteWithDate }) => (
    <TouchableOpacity style={styles.noteCard}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
      <Text style={styles.noteDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyNotes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 20,
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
    marginBottom: 10,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});

export default NotesListScreen; 