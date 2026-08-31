import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoteLocation } from '../../../core/models/note';
import { UiButton, UiEmptyState, UiField, UiTextInput, UiTextarea } from '../../../shared/components';

@Component({ selector: 'app-location-detail', changeDetection: ChangeDetectionStrategy.OnPush, imports: [DecimalPipe, ReactiveFormsModule, UiButton, UiEmptyState, UiField, UiTextInput, UiTextarea], templateUrl: './location-detail.html', styleUrl: './location-detail.css' })
export class LocationDetail {
  readonly location = input<NoteLocation | null>(null);
  readonly breadcrumb = input.required<NoteLocation[]>();
  readonly mode = input.required<'view' | 'create-root' | 'create-child' | 'edit'>();
  readonly coordinates = input<{ latitude: number; longitude: number } | null>(null);
  readonly edit = output<void>();
  readonly addChild = output<void>();
  readonly save = output<{ title: string; description: string }>();
  readonly cancel = output<void>();
  private readonly formBuilder = inject(FormBuilder);
  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(20000)],
  });

  constructor() {
    effect(() => {
      const location = this.location();
      this.form.reset({
        title: this.mode() === 'edit' ? location?.title ?? '' : '',
        description: this.mode() === 'edit' ? location?.description ?? '' : '',
      });
    });
  }

  protected get editing(): boolean { return this.mode() !== 'view'; }
  protected get heading(): string { return this.mode() === 'edit' ? 'Edit note-location' : 'Add note-location'; }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description } = this.form.getRawValue();
    this.save.emit({ title: title.trim(), description });
  }
}