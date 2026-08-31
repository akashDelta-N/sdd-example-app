import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { Note, NoteInput } from '../models/note';
import { NotesApi } from './notes-api';

@Injectable({ providedIn: 'root' })
export class NotesStore {
  private readonly api = inject(NotesApi);
  private readonly searchTerm$ = new Subject<string>();

  readonly notes = signal<Note[]>([]);
  readonly search = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);

  constructor() {
    this.searchTerm$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => void this.load());
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.notes.set(await firstValueFrom(this.api.list(this.search())));
    } catch {
      this.error.set('Could not load notes. Is the API running?');
    } finally {
      this.loading.set(false);
    }
  }

  setSearch(term: string): void {
    this.search.set(term);
    this.searchTerm$.next(term);
  }

  async create(input: NoteInput): Promise<void> {
    await this.mutate(() => firstValueFrom(this.api.create(input)), 'Could not save the note.');
  }

  async update(id: string, input: NoteInput): Promise<void> {
    await this.mutate(() => firstValueFrom(this.api.update(id, input)), 'Could not save the note.');
    this.editingId.set(null);
  }

  async remove(id: string): Promise<void> {
    await this.mutate(() => firstValueFrom(this.api.remove(id)), 'Could not delete the note.');
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
  }

  startEdit(id: string): void {
    this.editingId.set(id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  private async mutate(action: () => Promise<unknown>, errorMessage: string): Promise<void> {
    this.error.set(null);
    try {
      await action();
      await this.load();
    } catch {
      this.error.set(errorMessage);
    }
  }
}
