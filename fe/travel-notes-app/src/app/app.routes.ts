import { Routes } from '@angular/router';
import { NotesPage } from './features/notes/notes-page/notes-page';

export const routes: Routes = [
  { path: '', component: NotesPage },
  { path: '**', redirectTo: '' }
];
