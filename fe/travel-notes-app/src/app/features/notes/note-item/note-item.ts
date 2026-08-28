import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Note } from '../../../core/models/note';
import { UiButton, UiCard, UiCol, UiRow } from '../../../shared/components';

@Component({
  selector: 'app-note-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UiButton, UiCard, UiCol, UiRow],
  templateUrl: './note-item.html',
  styleUrl: './note-item.css',
})
export class NoteItem {
  readonly note = input.required<Note>();

  readonly edit = output<number>();
  readonly remove = output<number>();
}
