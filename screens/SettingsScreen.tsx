import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ThemeContext } from '../App';
import { NotesService } from '../utils/storage';
import { exportNotesToJson } from '../utils/exportNotes';
import { importNotesFromJson } from '../utils/importNotes';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Handle exporting notes
  const handleExportNotes = async () => {
    try {
      setIsExporting(true);
      
      // Get all notes from storage
      const notes = await NotesService.getAllNotes();
      
      if (notes.length === 0) {
        Alert.alert('No Notes', 'There are no notes to export.');
        return;
      }
      
      // Export notes to JSON file
      const success = await exportNotesToJson(notes);
      
      if (success) {
        Alert.alert('Success', 'Notes exported successfully');
      } else {
        Alert.alert('Error', 'Failed to export notes');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'An error occurred while exporting notes');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle importing notes
  const handleImportNotes = async () => {
    try {
      setIsImporting(true);
      
      // Import notes from JSON file
      const importedNotes = await importNotesFromJson();
      
      if (!importedNotes || importedNotes.length === 0) {
        Alert.alert('No Notes', 'No notes found to import.');
        return;
      }
      
      // Import notes using the NotesService
      const result = await NotesService.importNotes(importedNotes);
      
      // Show summary of what happened
      if (result.added > 0 || result.updated > 0) {
        let message = '';
        if (result.added > 0) {
          message += `Added ${result.added} new notes. `;
        }
        if (result.updated > 0) {
          message += `Updated ${result.updated} existing notes.`;
        }
        
        Alert.alert('Import Complete', message);
        
        // Refresh the home screen
        navigation.goBack();
      } else {
        Alert.alert('Import Complete', 'No changes were made.');
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'An error occurred while importing notes');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark
        ]}>
          Appearance
        </Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons 
              name="moon-outline" 
              size={22} 
              color={isDarkMode ? '#fff' : '#333'} 
              style={styles.settingIcon} 
            />
            <Text style={[
              styles.settingLabel,
              isDarkMode && styles.settingLabelDark
            ]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark
        ]}>
          Data Management
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.button,
            isExporting && styles.buttonDisabled
          ]}
          onPress={handleExportNotes}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="arrow-up-circle-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Export Notes</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button,
            styles.importButton,
            isImporting && styles.buttonDisabled
          ]}
          onPress={handleImportNotes}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="arrow-down-circle-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Import Notes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark
        ]}>
          About
        </Text>
        <Text style={[
          styles.aboutText,
          isDarkMode && styles.aboutTextDark
        ]}>
          MyNotesApp v1.0.0
        </Text>
        <Text style={[
          styles.aboutDescription,
          isDarkMode && styles.aboutDescriptionDark
        ]}>
          A simple note-taking app with dark mode support and data export/import capabilities.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingLabelDark: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  importButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  aboutTextDark: {
    color: '#fff',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aboutDescriptionDark: {
    color: '#aaa',
  },
});

export default SettingsScreen; 