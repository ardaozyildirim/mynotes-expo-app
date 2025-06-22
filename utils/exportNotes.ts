import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Note } from './storage';

/**
 * Export notes to a JSON file and share it
 * @param notes Array of notes to export
 * @returns Boolean indicating if export was successful
 */
export const exportNotesToJson = async (notes: Note[]): Promise<boolean> => {
  try {
    // Create a JSON string from the notes
    const jsonString = JSON.stringify(notes, null, 2);
    
    // Create a temporary file path
    const fileDate = new Date().toISOString().split('T')[0];
    const fileName = `notes_export_${fileDate}.json`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;
    
    // Write the JSON to the file
    await FileSystem.writeAsStringAsync(filePath, jsonString);
    
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      // Share the file
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Notes',
        UTI: 'public.json'
      });
      return true;
    } else {
      console.error('Sharing is not available on this device');
      return false;
    }
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
}; 