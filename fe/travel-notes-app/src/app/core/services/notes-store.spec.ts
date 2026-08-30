import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Note } from '../models/note';
import { NotesApi } from './notes-api';
import { NotesStore } from './notes-store';

function makeNote(id: number, title: string): Note {
  return {
    id: `00000000-0000-0000-0000-00000000000${id}`,
    title,
    body: 'body',
    latitude: 38.7223,
    longitude: -9.1393,
    parentId: null,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('NotesStore', () => {
  let api: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    archive: ReturnType<typeof vi.fn>;
  };
  let store: NotesStore;

  beforeEach(() => {
    api = {
      list: vi.fn(() => of([makeNote(1, 'Lisbon')])),
      create: vi.fn(() => of(makeNote(2, 'Porto'))),
      update: vi.fn(() => of(undefined)),
      remove: vi.fn(() => of(undefined)),
      archive: vi.fn(() => of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: NotesApi, useValue: api }],
    });

    store = TestBed.inject(NotesStore);
  });

  it('loads notes and clears the loading flag', async () => {
    await store.load();

    expect(store.notes()).toHaveLength(1);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('surfaces an error when loading fails', async () => {
    api.list.mockReturnValueOnce(throwError(() => new Error('offline')));

    await store.load();

    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });

  it('passes the current search term to the api', async () => {
    store.setSearch('lisbon');
    await store.load();

    expect(api.list).toHaveBeenCalledWith('lisbon');
  });

  it('reloads the list after creating a note', async () => {
    await store.create({ title: 'Porto', body: '', latitude: 41.1579, longitude: -8.6291, parentId: null });

    expect(api.create).toHaveBeenCalledWith({ title: 'Porto', body: '', latitude: 41.1579, longitude: -8.6291, parentId: null });
    expect(api.list).toHaveBeenCalled();
  });

  it('leaves edit mode after a successful update', async () => {
    store.startEdit('00000000-0000-0000-0000-000000000001');
    await store.update('00000000-0000-0000-0000-000000000001', { title: 'Lisbon revised', body: '', latitude: 38.7223, longitude: -9.1393, parentId: null });

    expect(api.update).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001', { title: 'Lisbon revised', body: '', latitude: 38.7223, longitude: -9.1393, parentId: null });
    expect(store.editingId()).toBeNull();
  });

  it('leaves edit mode when the edited note is deleted', async () => {
    store.startEdit('00000000-0000-0000-0000-000000000001');
    await store.remove('00000000-0000-0000-0000-000000000001');

    expect(api.remove).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001');
    expect(store.editingId()).toBeNull();
  });

  it('reports an error when deleting fails', async () => {
    api.remove.mockReturnValueOnce(throwError(() => new Error('boom')));

    await store.remove('00000000-0000-0000-0000-000000000001');

    expect(store.error()).toBeTruthy();
  });

  it('builds a root-to-selected hierarchy path and descendants', () => {
    store.notes.set([
      makeNote(1, 'Japan'),
      { ...makeNote(2, 'Tokyo'), parentId: makeNote(1, 'Japan').id },
      { ...makeNote(3, 'Asakusa'), parentId: makeNote(2, 'Tokyo').id },
    ]);
    store.select(makeNote(2, 'Tokyo').id);
    store.setIncludeDescendants(true);

    expect(store.path().map((note) => note.title)).toEqual(['Japan', 'Tokyo']);
    expect(store.visibleNotes().map((note) => note.title)).toEqual(['Tokyo', 'Asakusa']);
  });

  it('can filter child locations to active items only', () => {
    store.notes.set([makeNote(1, 'Japan'), { ...makeNote(2, 'Archived'), parentId: makeNote(1, 'Japan').id, isArchived: true }]);

    expect(store.childrenOf(makeNote(1, 'Japan').id, true).map((note) => note.title)).toEqual([]);
    expect(store.childrenOf(makeNote(1, 'Japan').id).map((note) => note.title)).toEqual(['Archived']);
  });

  it('archives then reloads note-locations', async () => {
    await store.archive('00000000-0000-0000-0000-000000000001');

    expect(api.archive).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001');
    expect(api.list).toHaveBeenCalled();
  });
});
