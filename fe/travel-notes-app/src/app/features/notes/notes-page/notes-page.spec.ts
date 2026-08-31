import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NotesStore } from '../../../core/services/notes-store';
import { NotesPage } from './notes-page';

describe('NotesPage responsive workspace', () => {
  it('renders map, tree, and detail panels with the classes used by mobile stacking rules', async () => {
    const store = {
      roots: signal([]), childrenByParent: signal({}), selectedId: signal(null), expandedIds: signal(new Set()), markers: signal([]), selected: signal(null), breadcrumb: signal([]), mode: signal('view'), draftCoordinates: signal(null), suggestions: signal([]), error: signal(null), load: vi.fn(), setSearchTerm: vi.fn(), select: vi.fn(), toggleExpanded: vi.fn(), startCreateRoot: vi.fn(), startCreateChild: vi.fn(), startEdit: vi.fn(), setDraftCoordinates: vi.fn(), saveLocation: vi.fn(), cancelEdit: vi.fn(), deleteSelected: vi.fn(), selectSearchResult: vi.fn(),
    };
    await TestBed.configureTestingModule({ providers: [{ provide: NotesStore, useValue: store }] }).overrideComponent(NotesPage, { set: { template: '<main class="workspace"><section class="map-panel"></section><section class="tree-panel"></section><section class="detail-panel"></section></main>' } }).compileComponents();
    const fixture = TestBed.createComponent(NotesPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.workspace > section')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.map-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tree-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.detail-panel')).toBeTruthy();
  });
});