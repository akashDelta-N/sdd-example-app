import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Note, NoteInput } from '../../../core/models/note';
import { UiButton, UiCard, UiCol, UiField, UiRow, UiTextInput, UiTextarea } from '../../../shared/components';

@Component({
  selector: 'app-note-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiCard, UiCol, UiField, UiRow, UiTextInput, UiTextarea],
  templateUrl: './note-form.html',
  styleUrl: './note-form.css',
})
export class NoteForm {
  readonly note = input<Note | null>(null);
  readonly saving = input(false);

  readonly save = output<NoteInput>();
  readonly cancel = output<void>();

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
  });

  constructor() {
    effect(() => {
      const note = this.note();
      this.form.reset({ title: note?.title ?? '', description: note?.description ?? '' });
    });
  }

  protected get isEditing(): boolean {
    return this.note() !== null;
  }

  protected get titleError(): string | undefined {
    const control = this.form.controls.title;
    if (!control.touched || control.valid) {
      return undefined;
    }
    return control.hasError('required') ? 'A title is required.' : 'Keep the title under 200 characters.';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description } = this.form.getRawValue();
    this.save.emit({ title: title.trim(), description, latitude: 0, longitude: 0 });

    if (!this.isEditing) {
      this.form.reset({ title: '', description: '' });
    }
  }
}
