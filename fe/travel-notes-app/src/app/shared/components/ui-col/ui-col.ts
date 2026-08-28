import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Align, Gap, GapInput, toGap } from '../ui-row/ui-row';

const ALIGN: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

@Component({
  selector: 'ui-col',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './ui-col.css',
  host: {
    '[style.gap]': 'gapValue()',
    '[style.align-items]': 'alignItems()',
  },
})
export class UiCol {
  readonly gap = input<Gap, GapInput>(3, { transform: toGap });
  readonly align = input<Align>('stretch');

  protected readonly gapValue = computed(() => `var(--space-${this.gap()})`);
  protected readonly alignItems = computed(() => ALIGN[this.align()]);
}
