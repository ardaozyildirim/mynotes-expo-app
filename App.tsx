import React, { createContext, useState, useContext, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import NotesListScreen from './screens/NotesListScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import EditNoteScreen from './screens/EditNoteScreen';
import SettingsScreen from './screens/SettingsScreen';
import { loadThemePreference, saveThemePreference, Note } from './utils/storage';

// Export Note type from storage.ts

// Define the theme context
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

// Define the type for our stack navigator
export type RootStackParamList = {
  Home: undefined;
  AddNote: undefined;
  NotesList: undefined;
  NoteDetail: { noteId: string };
  EditNote: { noteId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await loadThemePreference();
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);
    saveThemePreference(newThemeValue);
  };

  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  // Show nothing while loading theme preference
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <SafeAreaProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerBackTitle: 'Back'
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Notes App' }}
            />
            <Stack.Screen 
              name="AddNote" 
              component={AddNoteScreen} 
              options={{ title: 'Add Note' }}
            />
            <Stack.Screen 
              name="NotesList" 
              component={NotesListScreen} 
              options={{ title: 'My Notes' }}
            />
            <Stack.Screen 
              name="NoteDetail" 
              component={NoteDetailScreen} 
              options={{ title: 'Note Details' }}
            />
            <Stack.Screen 
              name="EditNote" 
              component={EditNoteScreen} 
              options={{ title: 'Edit Note' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}
