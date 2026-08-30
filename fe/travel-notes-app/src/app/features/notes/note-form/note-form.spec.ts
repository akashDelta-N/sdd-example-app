import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteInput } from '../../../core/models/note';
import { NoteForm } from './note-form';

describe('NoteForm', () => {
  let fixture: ComponentFixture<NoteForm>;
  let saved: NoteInput[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NoteForm] }).compileComponents();
    fixture = TestBed.createComponent(NoteForm);
    fixture.componentRef.setInput('coordinates', { latitude: 38.7223, longitude: -9.1393 });
    saved = [];
    fixture.componentInstance.save.subscribe((value) => saved.push(value));
    await fixture.whenStable();
  });

  function type(selector: string, value: string): void {
    const el: HTMLInputElement = fixture.nativeElement.querySelector(selector);
    el.value = value;
    el.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
  }

  it('does not emit when the title is empty', async () => {
    submit();
    await fixture.whenStable();

    expect(saved).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('title is required');
  });

  it('emits a trimmed note when valid', async () => {
    type('ui-text-input input', '  Lisbon  ');
    type('ui-textarea textarea', 'Tram 28');
    await fixture.whenStable();

    submit();

    expect(saved).toEqual([{ title: 'Lisbon', body: 'Tram 28', latitude: 38.7223, longitude: -9.1393, parentId: null }]);
  });

  it('clears itself after creating a note', async () => {
    type('ui-text-input input', 'Lisbon');
    await fixture.whenStable();

    submit();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('ui-text-input input').value).toBe('');
  });

  it('pre-fills and keeps the values when editing', async () => {
    fixture.componentRef.setInput('note', {
      id: 1,
      title: 'Porto',
      body: 'Port wine',
      latitude: 41.1579,
      longitude: -8.6291,
      parentId: null,
      isArchived: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('ui-text-input input').value).toBe('Porto');

    submit();
    await fixture.whenStable();

    expect(saved).toEqual([{ title: 'Porto', body: 'Port wine', latitude: 41.1579, longitude: -8.6291, parentId: null }]);
    expect(fixture.nativeElement.querySelector('ui-text-input input').value).toBe('Porto');
  });

  it('uses the selected parent as the default for a new child', async () => {
    const parentId = '00000000-0000-0000-0000-000000000007';
    fixture.componentRef.setInput('locations', [{ id: parentId, title: 'Tokyo', body: '', latitude: 35, longitude: 139, parentId: null, isArchived: false, createdAt: '', updatedAt: '' }]);
    fixture.componentRef.setInput('defaultParentId', parentId);
    fixture.detectChanges();
    await fixture.whenStable();
    type('ui-text-input input', 'Asakusa');
    await fixture.whenStable();

    submit();

    expect(saved[0].parentId).toBe(parentId);
  });

  it('allows an existing note-location to move to another parent', async () => {
    const oldParent = '00000000-0000-0000-0000-000000000002';
    const newParent = '00000000-0000-0000-0000-000000000003';
    fixture.componentRef.setInput('locations', [
      { id: oldParent, title: 'Tokyo', body: '', latitude: 35, longitude: 139, parentId: null, isArchived: false, createdAt: '', updatedAt: '' },
      { id: newParent, title: 'Kanto', body: '', latitude: 35, longitude: 139, parentId: null, isArchived: false, createdAt: '', updatedAt: '' },
    ]);
    fixture.componentRef.setInput('note', { id: '00000000-0000-0000-0000-000000000001', title: 'Asakusa', body: '', latitude: 35.71, longitude: 139.79, parentId: oldParent, isArchived: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' });
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('ui-text-input input');
    inputs[1].value = 'Kanto';
    inputs[1].dispatchEvent(new Event('input'));
    await fixture.whenStable();

    submit();

    expect(saved[0].parentId).toBe(newParent);
  });
});
