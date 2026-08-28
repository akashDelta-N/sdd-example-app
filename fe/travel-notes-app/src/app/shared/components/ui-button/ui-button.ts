import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Component({
  selector: 'ui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.css',
  host: {
    '[class]': '"variant-" + variant()',
    '[class.full-width]': 'fullWidth()',
  },
})
export class UiButton {
  readonly variant = input<ButtonVariant>('secondary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input<string>();

  readonly clicked = output<void>();

  protected onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
