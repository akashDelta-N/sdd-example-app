import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-empty-state.html',
  styleUrl: './ui-empty-state.css',
})
export class UiEmptyState {
  readonly heading = input.required<string>();
  readonly message = input<string>();
}
