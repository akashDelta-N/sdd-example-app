import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-field.html',
  styleUrl: './ui-field.css',
})
export class UiField {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly required = input(false);
}
