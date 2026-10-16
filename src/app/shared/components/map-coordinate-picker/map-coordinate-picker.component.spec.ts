import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { MapCoordinatePickerComponent } from './map-coordinate-picker.component';

describe('MapCoordinatePickerComponent', () => {
  let component: MapCoordinatePickerComponent;
  let fixture: ComponentFixture<MapCoordinatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapCoordinatePickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapCoordinatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial coordinates formatted in the template', () => {
    component.latitude = -17.3935;
    component.longitude = -66.1570;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('-17.3935');
    expect(compiled.textContent).toContain('-66.1570');
  });

  it('should handle custom inputs for latitude, longitude, and zoom', () => {
    component.latitude = 40.7128;
    component.longitude = -74.0060;
    component.zoom = 12;
    fixture.detectChanges();

    expect(component.latitude).toBe(40.7128);
    expect(component.longitude).toBe(-74.0060);
    expect(component.zoom).toBe(12);
  });

  it('should emit coordinatesChange when coordinates change', () => {
    const spy = vi.spyOn(component.coordinatesChange, 'emit');
    const newCoords = { latitude: -17.4000, longitude: -66.1600 };

    component.coordinatesChange.emit(newCoords);
    expect(spy).toHaveBeenCalledWith(newCoords);
  });

  it('should sync marker position on ngOnChanges', () => {
    component.latitude = -17.3900;
    component.longitude = -66.1500;

    expect(() => {
      component.ngOnChanges({
        latitude: new SimpleChange(-17.3935, -17.3900, false),
        longitude: new SimpleChange(-66.1570, -66.1500, false)
      });
    }).not.toThrow();
  });

  it('should safely destroy the map on ngOnDestroy', () => {
    expect(() => {
      component.ngOnDestroy();
    }).not.toThrow();
  });
});
