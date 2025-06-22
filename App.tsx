import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import NotesListScreen from './screens/NotesListScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import EditNoteScreen from './screens/EditNoteScreen';

// Define the Note type
export type Note = {
  id: string;
  title: string;
  content: string;
};

// Define the type for our stack navigator
export type RootStackParamList = {
  Home: { 
    newNote?: Note;
    updatedNote?: Note;
    noteIndex?: number;
    deleteNoteId?: string;
  } | undefined;
  AddNote: undefined;
  NotesList: undefined;
  NoteDetail: { note: Note };
  EditNote: { note: Note; noteIndex: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Not Uygulaması' }}
          />
          <Stack.Screen 
            name="AddNote" 
            component={AddNoteScreen} 
            options={{ title: 'Not Ekle' }}
          />
          <Stack.Screen 
            name="NotesList" 
            component={NotesListScreen} 
            options={{ title: 'Notlarım' }}
          />
          <Stack.Screen 
            name="NoteDetail" 
            component={NoteDetailScreen} 
            options={{ title: 'Not Detayı' }}
          />
          <Stack.Screen 
            name="EditNote" 
            component={EditNoteScreen} 
            options={{ title: 'Notu Düzenle' }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
