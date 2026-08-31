import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoteInput } from '../../../core/models/note';
import { NotesStore } from '../../../core/services/notes-store';
import { UiCol, UiContainer, UiField, UiTextInput } from '../../../shared/components';
import { NoteForm } from '../note-form/note-form';
import { NoteList } from '../note-list/note-list';

@Component({
  selector: 'app-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NoteForm, NoteList, ReactiveFormsModule, UiCol, UiContainer, UiField, UiTextInput],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',
})
export class NotesPage implements OnInit {
  protected readonly store = inject(NotesStore);
  protected readonly searchControl = new FormControl('', { nonNullable: true });

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
  }

  protected onSave({ id, input }: { id: string; input: NoteInput }): void {
    void this.store.update(id, input);
  }

  protected onRemove(id: string): void {
    void this.store.remove(id);
  }
}
