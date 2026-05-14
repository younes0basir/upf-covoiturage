import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-google-maps-location-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <label class="block text-sm font-bold text-gray-700 mb-2">{{ label }}</label>
      <div class="relative">
        <input
          #inputRef
          type="text"
          [(ngModel)]="query"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          class="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
          [placeholder]="placeholder || 'Chercher un lieu...'"
        />
        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div *ngIf="showDropdown && suggestions.length > 0" class="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-auto">
        <button
          *ngFor="let item of suggestions"
          type="button"
          (click)="selectLocation(item)"
          class="w-full text-left p-4 hover:bg-blue-50 transition flex items-start space-x-3 border-b border-gray-50 last:border-0"
        >
          <div class="mt-1 text-blue-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <p class="font-bold text-sm text-gray-900">{{ item.name }}</p>
            <p class="text-xs text-gray-500 truncate w-64">{{ item.address }}</p>
          </div>
        </button>
      </div>

      <div *ngIf="showMap">
        <div class="absolute z-40 w-full mt-2 left-0">
          <div #mapRef class="w-full h-64 rounded-2xl shadow-2xl border-2 border-blue-200"></div>
          <div *ngIf="selectedLocation" class="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm rounded-b-2xl border-t border-blue-100">
            <p class="text-sm font-bold text-gray-900">{{ selectedLocation.name }}</p>
            <p class="text-xs text-gray-600">{{ selectedLocation.address }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GoogleMapsLocationInputComponent implements AfterViewInit, OnInit {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Output() onChange = new EventEmitter<{ id: string; name: string }>();

  @ViewChild('inputRef') inputRef!: ElementRef;
  @ViewChild('mapRef') mapRef!: ElementRef;

  query = '';
  suggestions: any[] = [];
  showDropdown = false;
  showMap = false;
  selectedLocation: any = null;
  featured: any[] = [];
  
  private map: any = null;
  private marker: any = null;
  private autocomplete: any = null;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadFeaturedLocations();
  }

  ngAfterViewInit() {
    this.initGoogleMaps();
  }

  private initGoogleMaps() {
    const loader = new Loader({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (this.inputRef && window.google) {
        this.autocomplete = new window.google.maps.places.Autocomplete(
          this.inputRef.nativeElement,
          {
            componentRestrictions: { country: 'MA' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
          }
        );

        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          if (place.geometry) {
            this.handlePlaceSelect(place);
          }
        });
      }
    });
  }

  private loadFeaturedLocations() {
    this.locationService.getUniversity().subscribe({
      next: (locations) => {
        this.featured = locations;
      },
      error: (err) => console.error('Error loading featured locations:', err)
    });
  }

  onInputChange(event: any) {
    const val = event.target.value;
    this.query = val;
    
    if (val.length === 0) {
      this.suggestions = this.featured.map(l => ({ ...l, source: 'local' }));
      this.showDropdown = true;
      this.showMap = false;
      return;
    }

    if (val.length < 2) {
      this.suggestions = [];
      this.showDropdown = false;
      return;
    }

    this.locationService.search(val).subscribe({
      next: (results) => {
        this.suggestions = (results || []).map(l => ({ ...l, source: 'local' }));
        this.showDropdown = true;
      },
      error: () => {
        this.suggestions = [];
        this.showDropdown = true;
      }
    });
  }

  onFocus() {
    if (this.query.length === 0) {
      this.suggestions = this.featured.map(l => ({ ...l, source: 'local' }));
      this.showDropdown = true;
    } else if (this.query.length >= 2) {
      this.showDropdown = true;
    }
  }

  private handlePlaceSelect(place: any) {
    const locationData = {
      name: place.name || place.formatted_address,
      address: place.formatted_address,
      formattedAddress: place.formatted_address,
      city: this.extractCity(place),
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      isUniversity: false
    };

    this.selectedLocation = locationData;
    this.query = place.formatted_address;
    this.showDropdown = false;
    this.showMap = true;

    this.locationService.create(locationData).subscribe({
      next: (newLoc) => {
        this.onChange.emit({ id: newLoc.id, name: newLoc.name });
      },
      error: (err) => {
        console.error('Error saving location:', err);
        this.onChange.emit({ id: '', name: locationData.name });
      }
    });

    this.updateMap(locationData);
  }

  selectLocation(item: any) {
    this.onChange.emit({ id: item.id, name: item.name });
    this.query = item.name;
    this.showDropdown = false;
    
    if (item.latitude && item.longitude) {
      this.selectedLocation = {
        name: item.name,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude
      };
      this.showMap = true;
      this.updateMap(this.selectedLocation);
    }
  }

  private updateMap(locationData: any) {
    if (this.mapRef && window.google) {
      if (!this.map) {
        this.map = new window.google.maps.Map(this.mapRef.nativeElement, {
          center: { lat: locationData.latitude, lng: locationData.longitude },
          zoom: 15,
          mapTypeId: 'roadmap'
        });

        this.marker = new window.google.maps.Marker({
          position: { lat: locationData.latitude, lng: locationData.longitude },
          map: this.map,
          title: locationData.name
        });
      } else {
        this.map.setCenter({ lat: locationData.latitude, lng: locationData.longitude });
        this.marker.setPosition({ lat: locationData.latitude, lng: locationData.longitude });
      }
    }
  }

  private extractCity(place: any): string {
    for (const component of place.address_components || []) {
      if (component.types.includes('locality')) {
        return component.long_name;
      }
    }
    return 'Maroc';
  }
}
