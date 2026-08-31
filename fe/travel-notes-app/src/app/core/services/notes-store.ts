import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { MapMarker, NoteLocation, NoteLocationInput, SearchResult } from '../models/note';
import { NotesApi } from './notes-api';

@Injectable({ providedIn: 'root' })
export class NotesStore {
  private readonly api = inject(NotesApi);
  private readonly searchTerms = new Subject<string>();
  readonly roots = signal<NoteLocation[]>([]);
  readonly childrenByParent = signal<Record<string, NoteLocation[]>>({});
  readonly selectedId = signal<string | null>(null);
  readonly selected = signal<NoteLocation | null>(null);
  readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  readonly mode = signal<'view' | 'create-root' | 'create-child' | 'edit'>('view');
  readonly draftCoordinates = signal<{ latitude: number; longitude: number } | null>(null);
  readonly searchTerm = signal('');
  readonly suggestions = signal<SearchResult[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly breadcrumb = computed(() => this.ancestorPath(this.selected()));
  readonly markers = computed<MapMarker[]>(() => {
    const selected = this.selected();
    if (!selected) {
      return this.roots().map((location) => this.toMarker(location));
    }

    const children = this.childrenByParent()[selected.id] ?? [];
    return children.length > 0 ? children.map((location) => this.toMarker(location)) : [this.toMarker(selected)];
  });

  constructor() {
    this.searchTerms
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => void this.loadSuggestions(term));
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.roots.set(await firstValueFrom(this.api.roots()));
    } catch {
      this.error.set('Could not load notes. Is the API running?');
    } finally {
      this.loading.set(false);
    }
  }

  async select(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const selected = await firstValueFrom(this.api.get(id));
      const children = await firstValueFrom(this.api.children(id));
      this.selectedId.set(id);
      this.selected.set(selected);
      this.childrenByParent.update((entries) => ({ ...entries, [id]: children }));
      await this.expandAncestors(selected);
    } catch {
      this.error.set('Could not open this location.');
    } finally {
      this.loading.set(false);
    }
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.searchTerms.next(term.trim());
  }

  async selectSearchResult(result: SearchResult): Promise<void> {
    this.suggestions.set([]);
    this.searchTerm.set('');
    await this.select(result.note.id);
  }

  async toggleExpanded(location: NoteLocation): Promise<void> {
    if (this.expandedIds().has(location.id)) {
      this.expandedIds.update((ids) => {
        const next = new Set(ids);
        next.delete(location.id);
        return next;
      });
      return;
    }

    await this.loadChildren(location.id);
    this.expandedIds.update((ids) => new Set(ids).add(location.id));
  }

  async create(input: NoteLocationInput): Promise<void> {
    this.error.set(null);
    try {
      const created = await firstValueFrom(this.api.create(input));
      if (input.parentId) this.invalidateChildren(input.parentId);
      await this.load();
      await this.select(created.id);
      this.cancelEdit();
    } catch {
      this.error.set('Could not save the location.');
    }
  }

  async update(id: string, input: NoteLocationInput): Promise<void> {
    this.error.set(null);
    try {
      await firstValueFrom(this.api.update(id, input));
      if (input.parentId) this.invalidateChildren(input.parentId);
      await this.load();
      await this.select(id);
      this.cancelEdit();
    } catch {
      this.error.set('Could not save the location.');
    }
  }

  async remove(id: string): Promise<void> {
    await this.mutate(() => firstValueFrom(this.api.remove(id)), 'Could not delete the note.');
  }

  startCreateRoot(): void {
    this.mode.set('create-root');
    this.draftCoordinates.set(null);
  }

  startCreateChild(): void {
    if (!this.selected()) return;
    this.mode.set('create-child');
    this.draftCoordinates.set(null);
  }

  startEdit(): void {
    const selected = this.selected();
    if (!selected) return;
    this.mode.set('edit');
    this.draftCoordinates.set({ latitude: selected.latitude, longitude: selected.longitude });
  }

  setDraftCoordinates(latitude: number, longitude: number): void {
    this.draftCoordinates.set({ latitude, longitude });
  }

  async saveLocation(values: { title: string; description: string; isArchived: boolean }): Promise<void> {
    const coordinates = this.draftCoordinates();
    if (!coordinates) {
      this.error.set('Choose a position on the map before saving.');
      return;
    }
    const selected = this.selected();
    const input: NoteLocationInput = { ...values, ...coordinates };
    if (this.mode() === 'create-child') input.parentId = selected?.id;
    if (this.mode() === 'edit' && selected) {
      input.parentId = selected.parentId;
      await this.update(selected.id, input);
      return;
    }
    await this.create(input);
  }

  cancelEdit(): void {
    this.mode.set('view');
    this.draftCoordinates.set(null);
  }

  async deleteSelected(): Promise<void> {
    const selected = this.selected();
    if (!selected) return;
    this.error.set(null);
    try {
      await firstValueFrom(this.api.remove(selected.id));
      const parentId = selected.parentId;
      if (parentId) this.invalidateChildren(parentId);
      this.selected.set(null);
      this.selectedId.set(null);
      this.cancelEdit();
      await this.load();
      if (parentId) await this.select(parentId);
    } catch {
      this.error.set('Could not delete this location. It may still have children or need archiving first.');
    }
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

  private async loadChildren(parentId: string): Promise<void> {
    if (this.childrenByParent()[parentId]) {
      return;
    }
    const children = await firstValueFrom(this.api.children(parentId));
    this.childrenByParent.update((entries) => ({ ...entries, [parentId]: children }));
  }

  private invalidateChildren(parentId: string): void {
    this.childrenByParent.update((entries) => {
      const { [parentId]: _, ...remaining } = entries;
      return remaining;
    });
  }

  private async loadSuggestions(term: string): Promise<void> {
    if (!term) {
      this.suggestions.set([]);
      return;
    }
    try {
      this.suggestions.set(await firstValueFrom(this.api.search(term)));
    } catch {
      this.error.set('Could not search locations.');
    }
  }

  private async expandAncestors(location: NoteLocation): Promise<void> {
    let current = location;
    const ancestors = new Set(this.expandedIds());
    while (current.parentId) {
      const parent = await firstValueFrom(this.api.get(current.parentId));
      await this.loadChildren(parent.id);
      ancestors.add(parent.id);
      current = parent;
    }
    this.expandedIds.set(ancestors);
  }

  private ancestorPath(location: NoteLocation | null): NoteLocation[] {
    if (!location) {
      return [];
    }
    const path = [location];
    let parentId = location.parentId;
    const nodes = new Map<string, NoteLocation>();
    for (const root of this.roots()) nodes.set(root.id, root);
    for (const children of Object.values(this.childrenByParent())) {
      for (const child of children) nodes.set(child.id, child);
    }
    while (parentId) {
      const parent = nodes.get(parentId);
      if (!parent) break;
      path.unshift(parent);
      parentId = parent.parentId;
    }
    return path;
  }

  private toMarker(location: NoteLocation): MapMarker {
    return { id: location.id, title: location.title, latitude: location.latitude, longitude: location.longitude, isArchived: location.isArchived };
  }
}
