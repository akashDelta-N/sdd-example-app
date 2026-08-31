import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Note, NoteInput } from '../models/note';

@Injectable({ providedIn: 'root' })
export class NotesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/notes';

  list(search?: string): Observable<Note[]> {
    const params = search?.trim() ? new HttpParams().set('search', search.trim()) : undefined;
    return this.http.get<Note[]>(this.baseUrl, { params });
  }

  create(input: NoteInput): Observable<Note> {
    return this.http.post<Note>(this.baseUrl, input);
  }

  update(id: string, input: NoteInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, input);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
