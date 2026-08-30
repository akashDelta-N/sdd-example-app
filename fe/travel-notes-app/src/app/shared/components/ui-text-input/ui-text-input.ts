import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-text-input.html',
  styleUrls: ['../ui-control.css', './ui-text-input.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextInput),
      multi: true,
    },
  ],
})
export class UiTextInput implements ControlValueAccessor {
  readonly placeholder = input('');
  readonly type = input<'text' | 'search'>('text');
  readonly autocomplete = input('off');
  readonly ariaLabel = input<string>();
  readonly list = input<string>();

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
