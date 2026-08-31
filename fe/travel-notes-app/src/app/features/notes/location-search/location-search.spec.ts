import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { LocationSearch } from './location-search';

describe('LocationSearch', () => {
  let fixture: ComponentFixture<LocationSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LocationSearch] }).compileComponents();
    fixture = TestBed.createComponent(LocationSearch);
    fixture.componentRef.setInput('control', new FormControl('asa', { nonNullable: true }));
    fixture.componentRef.setInput('results', [{ note: { id: 'asa', title: 'Asakusa', description: '', latitude: 35, longitude: 139, parentId: null, isArchived: false, childCount: 0, createdAt: '', updatedAt: '' }, ancestors: [] }]);
    fixture.detectChanges();
  });

  it('emits the selected suggestion', () => {
    const selected: string[] = [];
    fixture.componentInstance.selectResult.subscribe((result) => selected.push(result.note.id));
    (fixture.nativeElement.querySelector('.suggestions button') as HTMLButtonElement).click();
    expect(selected).toEqual(['asa']);
  });
});