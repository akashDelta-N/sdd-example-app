import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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
  readonly editingId = input<string | null>(null);
  readonly filtered = input(false);
  protected readonly orderedNotes = computed(() => {
    const notes = this.notes();
    const byParent = new Map<string | null, Note[]>();
    notes.forEach((note) => byParent.set(note.parentId, [...(byParent.get(note.parentId) ?? []), note]));
    const ordered: Note[] = [];
    const visit = (parentId: string | null) => (byParent.get(parentId) ?? []).forEach((note) => { ordered.push(note); visit(note.id); });
    visit(null);
    return ordered.length === notes.length ? ordered : notes;
  });

  readonly edit = output<string>();
  readonly remove = output<string>();
  readonly archive = output<string>();
  readonly save = output<{ id: string; input: NoteInput }>();
  readonly cancelEdit = output<void>();
  readonly select = output<string>();

  protected pathFor(note: Note): string {
    const notes = this.notes();
    const path: string[] = [];
    let current: Note | undefined = note;
    while (current) {
      path.unshift(current.title);
      current = notes.find((candidate) => candidate.id === current!.parentId);
    }
    return path.join(' > ');
  }
}
