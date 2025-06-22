import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Note } from '../App'; // Note type is defined in App.tsx

/**
 * Generates a filename with the current date and time
 * Format: notlar_YYYY-MM-DD_HH-MM-SS.json
 */
const generateFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `notlar_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;
};

/**
 * Saves notes to a file in the device's document directory
 * @param notes Array of notes to save
 * @returns Object with success status and path or error
 */
export const saveNotesToFile = async (notes: Note[]) => {
  try {
    // Generate filename with timestamp
    const filename = generateFilename();
    
    // Default path in app's document directory
    const path = FileSystem.documentDirectory + filename;
    const json = JSON.stringify(notes, null, 2);

    // Write the file to the app's document directory first
    await FileSystem.writeAsStringAsync(path, json);
    console.log('Geçici dosya oluşturuldu:', path);
    
    return { success: true, path, filename };
  } catch (error) {
    console.error('Yedekleme hatası:', error);
    return { success: false, error };
  }
};

/**
 * Shares the notes file for saving to a user-selected location
 * @param path Path to the temporary file
 * @param filename Suggested filename for saving
 * @returns Object with success status and path or error
 */
export const shareNotesFile = async (path: string, filename: string) => {
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) {
      throw new Error('Dosya bulunamadı');
    }

    // Use sharing API to let the user choose where to save the file
    await FileSystem.shareAsync(path, {
      dialogTitle: 'Notları Kaydet',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    
    return { success: true };
  } catch (error) {
    console.error('Dosya paylaşım hatası:', error);
    return { success: false, error };
  }
}; 