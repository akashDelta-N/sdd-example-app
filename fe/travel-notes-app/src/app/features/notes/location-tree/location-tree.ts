import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NoteLocation } from '../../../core/models/note';
import { UiIconButton } from '../../../shared/components';

@Component({
  selector: 'app-location-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, UiIconButton],
  templateUrl: './location-tree.html',
  styleUrl: './location-tree.css',
})
export class LocationTree {
  readonly roots = input.required<NoteLocation[]>();
  readonly childrenByParent = input.required<Record<string, NoteLocation[]>>();
  readonly selectedId = input<string | null>(null);
  readonly expandedIds = input.required<ReadonlySet<string>>();
  readonly selectLocation = output<string>();
  readonly toggleLocation = output<NoteLocation>();

  protected children(location: NoteLocation): NoteLocation[] {
    return this.childrenByParent()[location.id] ?? [];
  }

  protected isExpanded(location: NoteLocation): boolean {
    return this.expandedIds().has(location.id);
  }
}