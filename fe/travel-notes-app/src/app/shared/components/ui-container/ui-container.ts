import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ContainerSize = 'sm' | 'md' | 'lg';

const MAX_WIDTHS: Record<ContainerSize, string> = {
  sm: '32rem',
  md: '48rem',
  lg: '64rem',
};

@Component({
  selector: 'ui-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './ui-container.css',
  host: {
    '[style.max-width]': 'maxWidth()',
  },
})
export class UiContainer {
  readonly size = input<ContainerSize>('md');

  protected readonly maxWidth = computed(() => MAX_WIDTHS[this.size()]);
}
