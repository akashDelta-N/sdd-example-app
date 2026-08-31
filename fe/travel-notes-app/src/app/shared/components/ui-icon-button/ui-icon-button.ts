import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-icon-button.html',
  styleUrl: './ui-icon-button.css',
})
export class UiIconButton {
  readonly ariaLabel = input.required<string>();
  readonly disabled = input(false);
  readonly clicked = output<void>();

  protected onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}