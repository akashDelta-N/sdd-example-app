export interface Note {
  id: string;
  title: string;
  body: string;
  latitude: number;
  longitude: number;
  parentId: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  body: string;
  latitude: number;
  longitude: number;
  parentId: string | null;
}
