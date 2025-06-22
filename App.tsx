import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import AddNoteScreen from './screens/AddNoteScreen';

// Define the type for our stack navigator
type RootStackParamList = {
  Home: undefined;
  AddNote: undefined;
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
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
