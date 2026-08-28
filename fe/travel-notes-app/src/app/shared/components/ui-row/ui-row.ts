import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type Gap = 1 | 2 | 3 | 4 | 5 | 6;
export type GapInput = Gap | `${Gap}`;
export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type Justify = 'start' | 'center' | 'end' | 'between';

export const toGap = (value: GapInput): Gap =>
  typeof value === 'number' ? value : (Number(value) as Gap);

const JUSTIFY: Record<Justify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
};

const ALIGN: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

@Component({
  selector: 'ui-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './ui-row.css',
  host: {
    '[style.gap]': 'gapValue()',
    '[style.align-items]': 'alignItems()',
    '[style.justify-content]': 'justifyContent()',
    '[style.flex-wrap]': 'wrap() ? "wrap" : "nowrap"',
  },
})
export class UiRow {
  readonly gap = input<Gap, GapInput>(3, { transform: toGap });
  readonly align = input<Align>('center');
  readonly justify = input<Justify>('start');
  readonly wrap = input(false);

  protected readonly gapValue = computed(() => `var(--space-${this.gap()})`);
  protected readonly alignItems = computed(() => ALIGN[this.align()]);
  protected readonly justifyContent = computed(() => JUSTIFY[this.justify()]);
}
