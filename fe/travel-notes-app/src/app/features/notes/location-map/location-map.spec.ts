import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationMap } from './location-map';

let clickHandler: ((event: { pixel: unknown; coordinate: [number, number] }) => void) | undefined;
const source = { clear: vi.fn(), addFeature: vi.fn() };
const map = { on: vi.fn((_: string, handler: typeof clickHandler) => (clickHandler = handler)), setTarget: vi.fn(), forEachFeatureAtPixel: vi.fn() };

vi.mock('ol/Map', () => ({ default: class { constructor() { return map; } } }));
vi.mock('ol/View', () => ({ default: class {} }));
vi.mock('ol/layer/Tile', () => ({ default: class {} }));
vi.mock('ol/layer/Vector', () => ({ default: class {} }));
vi.mock('ol/source/OSM', () => ({ default: class {} }));
vi.mock('ol/source/Vector', () => ({ default: class { constructor() { return source; } } }));
vi.mock('ol/Feature', () => ({ default: class { set = vi.fn(); setStyle = vi.fn(); } }));
vi.mock('ol/geom/Point', () => ({ default: class {} }));
vi.mock('ol/proj', () => ({ fromLonLat: vi.fn((value) => value), toLonLat: vi.fn((value) => value) }));
vi.mock('ol/style', () => ({ Circle: class {}, Fill: class {}, Stroke: class {}, Style: class {} }));

describe('LocationMap', () => {
  let fixture: ComponentFixture<LocationMap>;
  beforeEach(async () => {
    source.clear.mockClear(); source.addFeature.mockClear(); map.on.mockClear();
    await TestBed.configureTestingModule({ imports: [LocationMap] }).compileComponents();
    fixture = TestBed.createComponent(LocationMap);
    fixture.componentRef.setInput('notes', [
      { id: '00000000-0000-0000-0000-000000000001', title: 'Tokyo', body: '', latitude: 35, longitude: 139, parentId: null, isArchived: false, createdAt: '', updatedAt: '' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'Old', body: '', latitude: 35, longitude: 139, parentId: null, isArchived: true, createdAt: '', updatedAt: '' },
    ]);
    fixture.detectChanges();
  });
  it('renders only active pins', () => expect(source.addFeature).toHaveBeenCalledTimes(1));
  it('emits a map position in add mode', () => {
    const picked: unknown[] = []; fixture.componentInstance.picked.subscribe((value) => picked.push(value));
    fixture.componentRef.setInput('mode', 'add'); clickHandler!({ pixel: {}, coordinate: [139, 35] });
    expect(picked).toEqual([{ latitude: 35, longitude: 139 }]);
  });
  it('renders a distinct pending-position marker', () => {
    fixture.componentRef.setInput('pendingCoordinates', { latitude: 36, longitude: 140 });
    fixture.detectChanges();

    expect(source.addFeature).toHaveBeenCalledTimes(3);
  });
});
