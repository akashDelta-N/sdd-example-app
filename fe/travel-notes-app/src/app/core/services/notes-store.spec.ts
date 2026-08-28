import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Note } from '../models/note';
import { NotesApi } from './notes-api';
import { NotesStore } from './notes-store';

function makeNote(id: number, title: string): Note {
  return {
    id,
    title,
    body: 'body',
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
  };
  let store: NotesStore;

  beforeEach(() => {
    api = {
      list: vi.fn(() => of([makeNote(1, 'Lisbon')])),
      create: vi.fn(() => of(makeNote(2, 'Porto'))),
      update: vi.fn(() => of(undefined)),
      remove: vi.fn(() => of(undefined)),
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
    await store.create({ title: 'Porto', body: '' });

    expect(api.create).toHaveBeenCalledWith({ title: 'Porto', body: '' });
    expect(api.list).toHaveBeenCalled();
  });

  it('leaves edit mode after a successful update', async () => {
    store.startEdit(1);
    await store.update(1, { title: 'Lisbon revised', body: '' });

    expect(api.update).toHaveBeenCalledWith(1, { title: 'Lisbon revised', body: '' });
    expect(store.editingId()).toBeNull();
  });

  it('leaves edit mode when the edited note is deleted', async () => {
    store.startEdit(1);
    await store.remove(1);

    expect(api.remove).toHaveBeenCalledWith(1);
    expect(store.editingId()).toBeNull();
  });

  it('reports an error when deleting fails', async () => {
    api.remove.mockReturnValueOnce(throwError(() => new Error('boom')));

    await store.remove(1);

    expect(store.error()).toBeTruthy();
  });
});
