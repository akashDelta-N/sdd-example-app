import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NoteLocation, NoteLocationInput, SearchResult } from '../models/note';

@Injectable({ providedIn: 'root' })
export class NotesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/notes';

  roots(): Observable<NoteLocation[]> {
    return this.http.get<NoteLocation[]>(this.baseUrl);
  }

  children(parentId: string): Observable<NoteLocation[]> {
    return this.http.get<NoteLocation[]>(this.baseUrl, {
      params: new HttpParams().set('parentId', parentId),
    });
  }

  get(id: string): Observable<NoteLocation> {
    return this.http.get<NoteLocation>(`${this.baseUrl}/${id}`);
  }

  search(term: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.baseUrl}/search`, {
      params: new HttpParams().set('term', term),
    });
  }

  create(input: NoteLocationInput): Observable<NoteLocation> {
    return this.http.post<NoteLocation>(this.baseUrl, input);
  }

  update(id: string, input: NoteLocationInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, input);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
