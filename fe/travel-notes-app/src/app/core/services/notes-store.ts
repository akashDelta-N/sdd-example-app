import { Injectable, computed, inject, signal } from '@angular/core';
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
  readonly selectedId = signal<string | null>(null);
  readonly includeDescendants = signal(false);
  readonly selected = computed(() => this.notes().find((note) => note.id === this.selectedId()) ?? null);
  readonly path = computed(() => this.getPath(this.selectedId()));
  readonly visibleNotes = computed(() => {
    const selectedId = this.selectedId();
    if (selectedId === null) return this.notes();
    const included = this.includeDescendants() ? this.descendantIds(selectedId) : new Set([selectedId]);
    return this.notes().filter((note) => included.has(note.id));
  });

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

  async archive(id: string): Promise<void> {
    await this.mutate(() => firstValueFrom(this.api.archive(id)), 'Could not archive the note-location.');
  }

  select(id: string | null): void { this.selectedId.set(id); }

  setIncludeDescendants(value: boolean): void { this.includeDescendants.set(value); }

  childrenOf(parentId: string | null, activeOnly = false): Note[] {
    return this.notes().filter((note) => note.parentId === parentId && (!activeOnly || !note.isArchived));
  }

  getPath(id: string | null): Note[] {
    const result: Note[] = [];
    let current = this.notes().find((note) => note.id === id);
    while (current) {
      result.unshift(current);
      current = this.notes().find((note) => note.id === current!.parentId);
    }
    return result;
  }

  private descendantIds(id: string): Set<string> {
    const result = new Set([id]);
    const visit = (parentId: string) => this.childrenOf(parentId).forEach((child) => { result.add(child.id); visit(child.id); });
    visit(id);
    return result;
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
