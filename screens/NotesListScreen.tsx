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
      title: 'Shopping List',
      content: 'Remember to buy bread, milk, eggs, cheese, and fruit.',
      date: 'June 10, 2023'
    },
    {
      id: '2',
      title: 'Meeting Notes',
      content: 'Project meeting on Monday at 2:00 PM. Don\'t forget to prepare the presentation.',
      date: 'June 15, 2023'
    },
    {
      id: '3',
      title: 'Book Recommendations',
      content: 'Sapiens, Atomic Habits, Deep Work, The Psychology of Money.',
      date: 'June 20, 2023'
    }
  ];

  // Render each note item
  const renderNoteItem = ({ item }: { item: NoteWithDate }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
    >
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