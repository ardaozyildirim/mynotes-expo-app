import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { Note } from './storage';

/**
 * Import notes from a JSON file
 * @returns Array of imported notes or empty array if import fails
 */
export const importNotesFromJson = async (): Promise<Note[]> => {
  try {
    // Pick a JSON file using DocumentPicker
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true
    });

    // Check if user cancelled or there was an error
    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log('Document picker cancelled or failed');
      return [];
    }

    const fileUri = result.assets[0].uri;
    
    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    // Parse the JSON content
    let importedNotes: Note[] = [];
    
    try {
      const parsedData = JSON.parse(fileContent);
      
      // Validate that the data is an array of notes
      if (Array.isArray(parsedData)) {
        importedNotes = parsedData.filter(note => {
          // Validate each note has the required fields
          return (
            note && 
            typeof note.id === 'string' && 
            typeof note.title === 'string' && 
            typeof note.content === 'string'
          );
        });
        
        // Add timestamps if they don't exist
        importedNotes = importedNotes.map(note => ({
          ...note,
          createdAt: note.createdAt || Date.now(),
          updatedAt: note.updatedAt || Date.now()
        }));
        
        console.log(`Successfully parsed ${importedNotes.length} notes`);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      Alert.alert(
        'Import Error',
        'The selected file contains invalid JSON data.',
        [{ text: 'OK' }]
      );
      return [];
    }
    
    return importedNotes;
  } catch (error) {
    console.error('Import error:', error);
    Alert.alert(
      'Import Error',
      'An error occurred while importing notes.',
      [{ text: 'OK' }]
    );
    return [];
  }
}; 