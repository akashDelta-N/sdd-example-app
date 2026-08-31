export interface NoteLocation {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  parentId: string | null;
  isArchived: boolean;
  childCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteLocationInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  parentId?: string | null;
  isArchived?: boolean;
}

export interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  isArchived: boolean;
}

export interface Ancestor {
  id: string;
  title: string;
}

export interface SearchResult {
  note: NoteLocation;
  ancestors: Ancestor[];
}

// Temporary compatibility aliases for the existing flat-note UI. Phase 3 replaces its callers.
export type Note = NoteLocation;
export type NoteInput = NoteLocationInput;
