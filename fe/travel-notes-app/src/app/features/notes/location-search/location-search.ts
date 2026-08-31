import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchResult } from '../../../core/models/note';
import { UiButton, UiField, UiTextInput } from '../../../shared/components';

@Component({
  selector: 'app-location-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiField, UiTextInput],
  templateUrl: './location-search.html',
  styleUrl: './location-search.css',
})
export class LocationSearch {
  readonly control = input.required<FormControl<string>>();
  readonly results = input.required<SearchResult[]>();
  readonly selectResult = output<SearchResult>();
}