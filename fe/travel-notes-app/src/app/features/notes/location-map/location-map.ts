import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, effect, inject, input, output, viewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Note } from '../../../core/models/note';

@Component({
  selector: 'app-location-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div #map class="map" aria-label="Location map"></div>',
  styleUrl: './location-map.css',
})
export class LocationMap implements AfterViewInit, OnDestroy {
  readonly notes = input.required<Note[]>();
  readonly mode = input<'browse' | 'add' | 'edit'>('browse');
  readonly selectedId = input<string | null>(null);
  readonly pendingCoordinates = input<{ latitude: number; longitude: number } | null>(null);
  readonly picked = output<{ latitude: number; longitude: number }>();
  readonly select = output<string>();
  private readonly mapHost = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private readonly source = new VectorSource();
  private readonly zone = inject(NgZone);
  private map?: Map;

  constructor() { effect(() => { this.notes(); this.selectedId(); this.pendingCoordinates(); this.renderPins(); }); }
  ngAfterViewInit(): void {
    this.map = new Map({ target: this.mapHost().nativeElement, layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source: this.source })], view: new View({ center: fromLonLat([0, 20]), zoom: 2 }) });
    this.map.on('singleclick', (event) => {
      const feature = this.map!.forEachFeatureAtPixel(event.pixel, (item) => item);
      const id = feature?.get('id') as string | undefined;
      if (id !== undefined && this.mode() === 'browse') this.zone.run(() => this.select.emit(id));
      else if (this.mode() !== 'browse') {
        const [longitude, latitude] = toLonLat(event.coordinate);
        this.zone.run(() => this.picked.emit({ latitude, longitude }));
      }
    });
    this.renderPins();
  }
  ngOnDestroy(): void { this.map?.setTarget(undefined); }
  private renderPins(): void {
    if (!this.map) return;
    this.source.clear();
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--color-primary').trim();
    const contrast = styles.getPropertyValue('--color-primary-contrast').trim();
    this.notes().filter((note) => !note.isArchived).forEach((note) => {
      const feature = new Feature(new Point(fromLonLat([note.longitude, note.latitude])));
      feature.set('id', note.id);
      feature.setStyle(new Style({ image: new CircleStyle({ radius: note.id === this.selectedId() ? 9 : 6, fill: new Fill({ color: primary }), stroke: new Stroke({ color: contrast, width: 2 }) }) }));
      this.source.addFeature(feature);
    });
    const pending = this.pendingCoordinates();
    if (pending) {
      const marker = new Feature(new Point(fromLonLat([pending.longitude, pending.latitude])));
      marker.setStyle(new Style({ image: new CircleStyle({ radius: 10, fill: new Fill({ color: styles.getPropertyValue('--color-danger').trim() }), stroke: new Stroke({ color: contrast, width: 3 }) }) }));
      this.source.addFeature(marker);
    }
  }
}