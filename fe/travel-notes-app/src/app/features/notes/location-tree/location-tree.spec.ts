import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteLocation } from '../../../core/models/note';
import { LocationTree } from './location-tree';

const root: NoteLocation = { id: 'root', title: 'Japan', description: '', latitude: 35, longitude: 139, parentId: null, isArchived: false, childCount: 1, createdAt: '', updatedAt: '' };

describe('LocationTree', () => {
  let fixture: ComponentFixture<LocationTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LocationTree] }).compileComponents();
    fixture = TestBed.createComponent(LocationTree);
    fixture.componentRef.setInput('roots', [root]);
    fixture.componentRef.setInput('childrenByParent', {});
    fixture.componentRef.setInput('expandedIds', new Set<string>());
    fixture.detectChanges();
  });

  it('emits a selected location id', () => {
    const selected: string[] = [];
    fixture.componentInstance.selectLocation.subscribe((id) => selected.push(id));
    (fixture.nativeElement.querySelector('.location-select') as HTMLButtonElement).click();
    expect(selected).toEqual(['root']);
  });
});