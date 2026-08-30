import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Note } from '../../../core/models/note';
import { NotesApi } from '../../../core/services/notes-api';
import { NotesStore } from '../../../core/services/notes-store';
import { LocationMap } from '../location-map/location-map';
import { NotesPage } from './notes-page';

@Component({ selector: 'app-location-map', template: '' })
class LocationMapStub {
  readonly notes = input.required<Note[]>();
  readonly selectedId = input<string | null>(null);
  readonly pendingCoordinates = input<{ latitude: number; longitude: number } | null>(null);
  readonly mode = input<'browse' | 'add' | 'edit'>('browse');
  readonly select = output<string>();
  readonly picked = output<{ latitude: number; longitude: number }>();
}

function note(id: number, title: string, parentId: number | null, body = ''): Note {
  const guid = (value: number) => `00000000-0000-0000-0000-00000000000${value}`;
  return { id: guid(id), title, body, latitude: 35, longitude: 139, parentId: parentId === null ? null : guid(parentId), isArchived: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' };
}

describe('NotesPage', () => {
  let fixture: ComponentFixture<NotesPage>;
  let store: NotesStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesPage],
      providers: [{ provide: NotesApi, useValue: { list: vi.fn(() => of([])), create: vi.fn(), update: vi.fn(), remove: vi.fn(), archive: vi.fn() } }],
    })
      .overrideComponent(NotesPage, { remove: { imports: [LocationMap] }, add: { imports: [LocationMapStub] } })
      .compileComponents();
    fixture = TestBed.createComponent(NotesPage);
    store = TestBed.inject(NotesStore);
    store.notes.set([note(1, 'Japan', null), note(2, 'Tokyo', 1, 'Book hotel'), note(3, 'Asakusa', 2, 'Visit early')]);
  });

  it('shows selected content and its breadcrumb path', () => {
    (fixture.componentInstance as any).select('00000000-0000-0000-0000-000000000002');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Book hotel');
    expect(fixture.nativeElement.textContent).toContain('Japan');
    expect(fixture.nativeElement.textContent).toContain('Tokyo');
  });

  it('shows a structural node and can include descendant content', () => {
    (fixture.componentInstance as any).select('00000000-0000-0000-0000-000000000001');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No written note yet.');

    (fixture.componentInstance as any).toggleDescendants();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Visit early');
  });

  it('shows duplicate title search results with their full paths', () => {
    store.notes.set([note(1, 'Japan', null), note(2, 'Ginza', 1), note(3, 'Korea', null), note(4, 'Ginza', 3)]);
    store.setSearch('Ginza');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Japan > Ginza');
    expect(fixture.nativeElement.textContent).toContain('Korea > Ginza');
  });

  it('shows no-match feedback for an empty search result', () => {
    store.notes.set([]);
    store.setSearch('Nowhere');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No matching notes');
  });
});
