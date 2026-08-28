import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Note, NoteInput } from '../../../core/models/note';
import { UiCol, UiEmptyState } from '../../../shared/components';
import { NoteForm } from '../note-form/note-form';
import { NoteItem } from '../note-item/note-item';

@Component({
  selector: 'app-note-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NoteForm, NoteItem, UiCol, UiEmptyState],
  templateUrl: './note-list.html',
})
export class NoteList {
  readonly notes = input.required<Note[]>();
  readonly editingId = input<number | null>(null);
  readonly filtered = input(false);

  readonly edit = output<number>();
  readonly remove = output<number>();
  readonly save = output<{ id: number; input: NoteInput }>();
  readonly cancelEdit = output<void>();
}
