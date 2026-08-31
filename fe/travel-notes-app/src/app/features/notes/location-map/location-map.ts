import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, effect, input, output } from '@angular/core';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { MapMarker } from '../../../core/models/note';

@Component({ selector: 'app-location-map', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './location-map.html', styleUrl: './location-map.css' })
export class LocationMap implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: true }) private readonly mapElement!: ElementRef<HTMLElement>;
  readonly markers = input.required<MapMarker[]>();
  readonly selectedId = input<string | null>(null);
  readonly editing = input(false);
  readonly draftCoordinates = input<{ latitude: number; longitude: number } | null>(null);
  readonly selectMarker = output<string>();
  readonly selectCoordinates = output<{ latitude: number; longitude: number }>();
  private readonly source = new VectorSource();
  private map?: Map;

  constructor() {
    effect(() => this.renderMarkers(this.markers(), this.selectedId(), this.draftCoordinates()));
  }

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source: this.source })],
      view: new View({ center: fromLonLat([139.767, 35.681]), zoom: 4 }),
    });
    this.map.on('singleclick', (event) => {
      const feature = this.map?.forEachFeatureAtPixel(event.pixel, (item) => item as Feature<Point>);
      const id = feature?.get('id') as string | undefined;
      if (id) {
        this.selectMarker.emit(id);
      } else if (this.editing()) {
        const [longitude, latitude] = toLonLat(event.coordinate);
        this.selectCoordinates.emit({ latitude, longitude });
      }
    });
    this.renderMarkers(this.markers(), this.selectedId(), this.draftCoordinates());
  }

  ngOnDestroy(): void { this.map?.setTarget(undefined); }

  private renderMarkers(markers: MapMarker[], selectedId: string | null, draft: { latitude: number; longitude: number } | null): void {
    this.source.clear();
    const features = markers.map((marker) => {
      const feature = new Feature(new Point(fromLonLat([marker.longitude, marker.latitude])));
      feature.set('id', marker.id);
      feature.setStyle(new Style({ image: new CircleStyle({ radius: marker.id === selectedId ? 10 : 7, fill: new Fill({ color: marker.isArchived ? '#6b7290' : '#e74c3c' }), stroke: new Stroke({ color: '#ffffff', width: 2 }) }) }));
      return feature;
    });
    if (draft) {
      const feature = new Feature(new Point(fromLonLat([draft.longitude, draft.latitude])));
      feature.setStyle(new Style({ image: new CircleStyle({ radius: 9, fill: new Fill({ color: '#f2b134' }), stroke: new Stroke({ color: '#1a1300', width: 2 }) }) }));
      features.push(feature);
    }
    this.source.addFeatures(features);
    const extent = this.source.getExtent();
    if (this.map && extent && features.length > 0) this.map.getView().fit(extent, { padding: [48, 48, 48, 48], maxZoom: 14, duration: 250 });
  }
}