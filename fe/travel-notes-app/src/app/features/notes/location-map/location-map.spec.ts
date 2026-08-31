import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationMap } from './location-map';

describe('LocationMap', () => {
  let fixture: ComponentFixture<LocationMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LocationMap] }).compileComponents();
    fixture = TestBed.createComponent(LocationMap);
    fixture.componentRef.setInput('markers', []);
    fixture.componentRef.setInput('selectedId', null);
  });

  it('creates the map host without requiring marker data', () => {
    expect(fixture.nativeElement.querySelector('.map')).toBeTruthy();
  });
});