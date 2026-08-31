import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteInput } from '../../../core/models/note';
import { NoteForm } from './note-form';

describe('NoteForm', () => {
  let fixture: ComponentFixture<NoteForm>;
  let saved: NoteInput[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NoteForm] }).compileComponents();
    fixture = TestBed.createComponent(NoteForm);
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

    expect(saved).toEqual([{ title: 'Lisbon', description: 'Tram 28', latitude: 0, longitude: 0 }]);
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
      id: 'portugal',
      title: 'Porto',
      description: 'Port wine',
      latitude: 41,
      longitude: -8,
      parentId: null,
      isArchived: false,
      childCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('ui-text-input input').value).toBe('Porto');

    submit();
    await fixture.whenStable();

    expect(saved).toEqual([{ title: 'Porto', description: 'Port wine', latitude: 0, longitude: 0 }]);
    expect(fixture.nativeElement.querySelector('ui-text-input input').value).toBe('Porto');
  });
});
