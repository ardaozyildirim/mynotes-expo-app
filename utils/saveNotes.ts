import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform, Linking } from 'react-native';
import { Note } from '../App'; // Note type is defined in App.tsx

/**
 * Check and request storage permissions
 * @returns Whether permission is granted
 */
const checkAndRequestPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need these permissions
  }
  
  try {
    const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Storage permission is required to save files. Please grant this permission in your device settings.',
        [
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

/**
 * Generates a filename with the current date and time
 * Format: notes_YYYY-MM-DD_HH-MM-SS.json
 */
const generateFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `notes_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;
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
    console.log('Temporary file created:', path);
    
    return { success: true, path, filename };
  } catch (error) {
    console.error('Backup error:', error);
    return { success: false, error };
  }
};

/**
 * Save file to media library (Android and iOS)
 * @param path Path to the file to save
 * @param filename Suggested filename
 */
const saveToMediaLibrary = async (path: string, filename: string) => {
  try {
    // Check permissions first
    const hasPermission = await checkAndRequestPermissions();
    if (!hasPermission) {
      throw new Error('Storage permission denied');
    }
    
    // Save the file to media library
    const asset = await MediaLibrary.createAssetAsync(path);
    
    // Create an album if it doesn't exist
    const album = await MediaLibrary.getAlbumAsync('MyNotesApp');
    if (album === null) {
      await MediaLibrary.createAlbumAsync('MyNotesApp', asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
    
    Alert.alert(
      'Success',
      `File saved to MyNotesApp album in your gallery as ${filename}`,
      [{ text: 'OK' }]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Media library error:', error);
    Alert.alert(
      'Error',
      'Failed to save to media library. Falling back to sharing.',
      [{ text: 'OK' }]
    );
    return { success: false, error };
  }
};

/**
 * Share file with other apps
 * @param path Path to the file to share
 */
const shareFile = async (path: string) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing not available');
    }
    
    await Sharing.shareAsync(path, {
      dialogTitle: 'Save Notes',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    
    return { success: true };
  } catch (error) {
    console.error('Sharing error:', error);
    Alert.alert(
      'Error',
      'Failed to share file.',
      [{ text: 'OK' }]
    );
    return { success: false, error };
  }
};

/**
 * Open the file in an external app
 * @param path Path to the file
 */
const openInExternalApp = async (path: string) => {
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) {
      throw new Error('File not found');
    }
    
    // Use Expo's FileSystem to get a shareable URI
    const contentUri = await FileSystem.getContentUriAsync(path);
    
    // Open the file with an external app
    await Linking.openURL(contentUri);
    
    return { success: true };
  } catch (error) {
    console.error('External app error:', error);
    return { success: false, error };
  }
};

/**
 * Saves the notes file to a user-selected directory
 * @param path Path to the temporary file
 * @param filename Suggested filename for saving
 * @returns Object with success status and path or error
 */
export const saveNotesToDirectory = async (path: string, filename: string) => {
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) {
      throw new Error('File not found');
    }

    // For Android, show options for saving
    if (Platform.OS === 'android') {
      Alert.alert(
        'Save Notes',
        'How would you like to save your notes?',
        [
          {
            text: 'Save to Gallery',
            onPress: async () => {
              await saveToMediaLibrary(path, filename);
            }
          },
          {
            text: 'Share',
            onPress: async () => {
              await shareFile(path);
            }
          },
          {
            text: 'Open With...',
            onPress: async () => {
              await openInExternalApp(path);
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      
      // Return success since we're handling the flow with alerts
      return { success: true };
    }

    // Fall back to sharing for iOS
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Sharing not available',
        'Saving to external directory is not available on your device',
        [{ text: 'OK' }]
      );
      return { success: false, error: 'Sharing not available' };
    }

    await Sharing.shareAsync(path, {
      dialogTitle: 'Save Notes',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    
    return { success: true };
  } catch (error) {
    console.error('File saving error:', error);
    return { success: false, error };
  }
}; 