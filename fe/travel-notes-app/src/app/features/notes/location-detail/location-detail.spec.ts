import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationDetail } from './location-detail';

describe('LocationDetail', () => {
  let fixture: ComponentFixture<LocationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LocationDetail] }).compileComponents();
    fixture = TestBed.createComponent(LocationDetail);
    fixture.componentRef.setInput('location', null);
    fixture.componentRef.setInput('breadcrumb', []);
    fixture.componentRef.setInput('mode', 'create-root');
    fixture.componentRef.setInput('coordinates', { latitude: 35.6812, longitude: 139.7671 });
    fixture.detectChanges();
  });

  it('emits validated form values without rendering a parent picker', async () => {
    const saved: unknown[] = [];
    fixture.componentInstance.save.subscribe((value) => saved.push(value));
    const title = fixture.nativeElement.querySelector('ui-text-input input') as HTMLInputElement;
    title.value = '  Tokyo  ';
    title.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    expect(saved).toEqual([{ title: 'Tokyo', description: '' }]);
    expect(fixture.nativeElement.textContent).not.toContain('Parent');
  });
});