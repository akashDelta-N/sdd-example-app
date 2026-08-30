import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoteInput } from '../../../core/models/note';
import { NotesStore } from '../../../core/services/notes-store';
import { UiButton, UiCol, UiContainer, UiField, UiRow, UiTextInput } from '../../../shared/components';
import { LocationMap } from '../location-map/location-map';
import { NoteForm } from '../note-form/note-form';
import { NoteItem } from '../note-item/note-item';
import { NoteList } from '../note-list/note-list';

@Component({
  selector: 'app-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NoteForm, NoteItem, NoteList, LocationMap, ReactiveFormsModule, UiButton, UiCol, UiContainer, UiField, UiRow, UiTextInput],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',
})
export class NotesPage implements OnInit {
  protected readonly store = inject(NotesStore);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly mode = signal<'browse' | 'add' | 'edit'>('browse');
  protected readonly coordinates = signal<{ latitude: number; longitude: number } | null>(null);

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((term) => this.store.setSearch(term));
  }

  ngOnInit(): void {
    void this.store.load();
  }

  protected onCreate(input: NoteInput): void {
    void this.store.create(input);
    this.coordinates.set(null);
    this.mode.set('browse');
  }

  protected onMapPick(coordinates: { latitude: number; longitude: number }): void {
    this.coordinates.set(coordinates);
    if (this.mode() === 'edit') {
      const note = this.store.selected();
      if (note) void this.store.update(note.id, { title: note.title, body: note.body, latitude: coordinates.latitude, longitude: coordinates.longitude, parentId: note.parentId });
    }
  }

  protected beginAdd(): void { this.coordinates.set(null); this.mode.set('add'); }

  protected select(id: string): void { this.store.select(id); this.coordinates.set(null); this.mode.set('browse'); }

  protected onSave({ id, input }: { id: string; input: NoteInput }): void {
    void this.store.update(id, input);
    this.mode.set('browse');
  }

  protected onRemove(id: string): void {
    void this.store.remove(id);
  }

  protected onArchive(id: string): void { void this.store.archive(id); }

  protected beginEdit(id: string): void {
    this.store.startEdit(id);
    this.store.select(id);
    const note = this.store.selected();
    this.coordinates.set(note ? { latitude: note.latitude, longitude: note.longitude } : null);
    this.mode.set('edit');
  }

  protected toggleDescendants(): void {
    this.store.setIncludeDescendants(!this.store.includeDescendants());
  }
}
