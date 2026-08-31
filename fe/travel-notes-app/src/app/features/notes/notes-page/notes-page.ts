import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { SearchResult } from '../../../core/models/note';
import { NotesStore } from '../../../core/services/notes-store';
import { UiCard, UiIconButton } from '../../../shared/components';
import { LocationDetail } from '../location-detail/location-detail';
import { LocationMap } from '../location-map/location-map';
import { LocationSearch } from '../location-search/location-search';
import { LocationTree } from '../location-tree/location-tree';

@Component({
  selector: 'app-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocationDetail, LocationMap, LocationSearch, LocationTree, UiCard, UiIconButton],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',
})
export class NotesPage implements OnInit {
  protected readonly store = inject(NotesStore);
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((term) => this.store.setSearchTerm(term));
  }
  ngOnInit(): void {
    void this.store.load();
  }

  protected onSelect(id: string): void {
    void this.store.select(id);
  }

  protected onSearchResult(result: SearchResult): void {
    this.searchControl.setValue('', { emitEvent: false });
    void this.store.selectSearchResult(result);
  }
}
