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
  readonly coordinates = input<{ latitude: number; longitude: number } | null>(null);
  readonly defaultParentId = input<string | null>(null);
  readonly locations = input<Note[]>([]);

  readonly save = output<NoteInput>();
  readonly cancel = output<void>();

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    body: [''],
    parentName: [''],
  });

  constructor() {
    effect(() => {
      const note = this.note();
      const coordinates = this.coordinates();
      this.form.reset({ title: note?.title ?? '', body: note?.body ?? '', parentName: this.parentLabel(note?.parentId ?? this.defaultParentId()) });
      this.latitude = note?.latitude ?? coordinates?.latitude ?? null;
      this.longitude = note?.longitude ?? coordinates?.longitude ?? null;
    });
  }

  protected get isEditing(): boolean {
    return this.note() !== null;
  }

  private latitude: number | null = null;
  private longitude: number | null = null;

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

    const { title, body, parentName } = this.form.getRawValue();
    if (this.latitude === null || this.longitude === null) return;
    const parentId = parentName.trim() ? this.locations().find((location) => this.parentLabel(location.id) === parentName)?.id ?? null : null;
    if (parentName.trim() && parentId === null) return;
    this.save.emit({ title: title.trim(), body, latitude: this.latitude, longitude: this.longitude, parentId });

    if (!this.isEditing) {
      this.form.reset({ title: '', body: '', parentName: this.parentLabel(this.defaultParentId()) });
    }
  }

  protected parentLabel(id: string | null): string {
    if (!id) return '';
    const path: string[] = [];
    let current = this.locations().find((location) => location.id === id);
    while (current) {
      path.unshift(current.title);
      current = this.locations().find((location) => location.id === current!.parentId);
    }
    return path.join(' > ');
  }
}
