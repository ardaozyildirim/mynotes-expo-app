import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const NOTES_STORAGE_KEY = 'notes_app_data';
const THEME_STORAGE_KEY = 'notes_app_theme';

// Note type definition
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// Notes service for CRUD operations
export const NotesService = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
      return [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  // Save all notes
  saveAllNotes: async (notes: Note[]): Promise<boolean> => {
    try {
      const jsonValue = JSON.stringify(notes);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  },

  // Add a new note
  addNote: async (title: string, content: string): Promise<Note | null> => {
    try {
      const notes = await NotesService.getAllNotes();
      
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const updatedNotes = [...notes, newNote];
      await NotesService.saveAllNotes(updatedNotes);
      
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  },

  // Get a note by ID
  getNoteById: async (id: string): Promise<Note | null> => {
    try {
      const notes = await NotesService.getAllNotes();
      const note = notes.find(note => note.id === id);
      return note || null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  // Update a note
  updateNote: async (updatedNote: Note): Promise<boolean> => {
    try {
      const notes = await NotesService.getAllNotes();
      const index = notes.findIndex(note => note.id === updatedNote.id);
      
      if (index !== -1) {
        // Update the note with new values and timestamp
        const noteToUpdate = {
          ...updatedNote,
          updatedAt: Date.now()
        };
        
        notes[index] = noteToUpdate;
        await NotesService.saveAllNotes(notes);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  },

  // Delete a note
  deleteNote: async (id: string): Promise<boolean> => {
    try {
      const notes = await NotesService.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      
      if (filteredNotes.length !== notes.length) {
        await NotesService.saveAllNotes(filteredNotes);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },
  
  // Import notes from external source
  importNotes: async (importedNotes: Note[]): Promise<{added: number, updated: number}> => {
    try {
      const currentNotes = await NotesService.getAllNotes();
      let added = 0;
      let updated = 0;
      
      // Create a map of existing notes by ID for quick lookup
      const existingNotesMap = new Map(currentNotes.map(note => [note.id, note]));
      const updatedNotes = [...currentNotes];
      
      importedNotes.forEach(importedNote => {
        if (existingNotesMap.has(importedNote.id)) {
          // Update existing note
          const index = updatedNotes.findIndex(note => note.id === importedNote.id);
          updatedNotes[index] = {
            ...importedNote,
            updatedAt: Date.now()
          };
          updated++;
        } else {
          // Add new note
          updatedNotes.push({
            ...importedNote,
            createdAt: importedNote.createdAt || Date.now(),
            updatedAt: Date.now()
          });
          added++;
        }
      });
      
      await NotesService.saveAllNotes(updatedNotes);
      return { added, updated };
    } catch (error) {
      console.error('Error importing notes:', error);
      return { added: 0, updated: 0 };
    }
  }
};

// Theme preference functions
export const saveThemePreference = async (isDarkMode: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkMode));
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
};

export const loadThemePreference = async (): Promise<boolean | null> => {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error loading theme preference:', error);
    return null;
  }
}; 