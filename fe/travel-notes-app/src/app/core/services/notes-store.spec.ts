import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NoteLocation } from '../models/note';
import { NotesApi } from './notes-api';
import { NotesStore } from './notes-store';

function location(id: string, parentId: string | null = null): NoteLocation {
  return { id, parentId, title: id, description: '', latitude: 35, longitude: 139, isArchived: false, childCount: 0, createdAt: '', updatedAt: '' };
}

describe('NotesStore', () => {
  let api: { roots: ReturnType<typeof vi.fn>; children: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; search: ReturnType<typeof vi.fn> };
  let store: NotesStore;

  beforeEach(() => {
    const root = location('root');
    const child = location('child', 'root');
    api = { roots: vi.fn(() => of([root])), children: vi.fn(() => of([child])), get: vi.fn((id: string) => of(id === 'root' ? root : child)), search: vi.fn(() => of([{ note: child, ancestors: [root] }])) };
    TestBed.configureTestingModule({ providers: [{ provide: NotesApi, useValue: api }] });
    store = TestBed.inject(NotesStore);
  });

  it('loads root locations for the initial map context', async () => {
    await store.load();
    expect(store.roots()).toHaveLength(1);
    expect(store.markers()[0].id).toBe('root');
  });

  it('selects a location and shows its direct children as markers', async () => {
    await store.load();
    await store.select('root');
    expect(store.selectedId()).toBe('root');
    expect(store.markers()[0].id).toBe('child');
    expect(store.breadcrumb().map((item) => item.id)).toEqual(['root']);
  });

  it('shows the selected location marker when it has no children', async () => {
    api.children.mockReturnValue(of([]));
    await store.select('child');
    expect(store.markers()[0].id).toBe('child');
  });

  it('surfaces an error when roots cannot load', async () => {
    api.roots.mockReturnValue(throwError(() => new Error('offline')));
    await store.load();
    expect(store.error()).toBeTruthy();
  });

  it('debounces type-ahead suggestions and preserves navigation selection', async () => {
    vi.useFakeTimers();
    store.setSearchTerm('child');
    await vi.advanceTimersByTimeAsync(250);
    expect(api.search).toHaveBeenCalledWith('child');
    expect(store.suggestions()[0].note.id).toBe('child');
    expect(store.selectedId()).toBeNull();
    vi.useRealTimers();
  });
});
