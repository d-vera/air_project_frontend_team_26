import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { RealTimeCardsComponent } from './real-time-cards.component';
import { AirQualityReading } from '../../../../models/air-quality.model';

describe('RealTimeCardsComponent', () => {
  let component: RealTimeCardsComponent;
  let fixture: ComponentFixture<RealTimeCardsComponent>;

  const mockReadings: AirQualityReading[] = [
    {
      deviceId: 'ACEA5AC8E720',
      deviceName: 'Central Sensor',
      time: '2026-11-11T12:00:00Z',
      temperature: 23.5,
      humidity: 48.2,
      co2: 420,
      pm1_0: 4.1,
      pm2_5: 9.5,
      pm10: 14.3
    },
    {
      deviceId: 'B189DF621C11',
      deviceName: 'North Sensor',
      time: '2026-11-11T12:00:00Z',
      temperature: 21.0,
      humidity: 52.0,
      co2: 510,
      pm1_0: 6.0,
      pm2_5: 12.1,
      pm10: 18.7
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealTimeCardsComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(RealTimeCardsComponent);
    component = fixture.componentInstance;
  });

  it('should render friendly sensor labels from sensorOptions in the dropdown', () => {
    component.sensorOptions = [
      { id: 'ACEA5AC8E720', label: 'Central Sensor (ACEA5AC8E720)' },
      { id: 'B189DF621C11', label: 'North Sensor (B189DF621C11)' }
    ];
    component.readings = mockReadings;
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('#deviceSelect option')
    ) as HTMLOptionElement[];

    expect(options.length).toBe(3); // All Devices + 2 sensors
    expect(options[1].value).toBe('ACEA5AC8E720');
    expect(options[1].textContent?.trim()).toBe('Central Sensor (ACEA5AC8E720)');
    expect(options[2].value).toBe('B189DF621C11');
    expect(options[2].textContent?.trim()).toBe('North Sensor (B189DF621C11)');
  });

  it('should fall back to deviceList strings when sensorOptions is empty', () => {
    component.deviceList = ['DEV_01', 'DEV_02'];
    component.readings = [];
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('#deviceSelect option')
    ) as HTMLOptionElement[];

    expect(options.length).toBe(3);
    expect(options[1].textContent?.trim()).toBe('DEV_01');
    expect(options[2].textContent?.trim()).toBe('DEV_02');
  });

  it('should emit selectedDeviceIdChange when a sensor is selected', () => {
    component.sensorOptions = [
      { id: 'ACEA5AC8E720', label: 'Central Sensor (ACEA5AC8E720)' }
    ];
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.selectedDeviceIdChange, 'emit');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deviceSelect');
    select.value = 'ACEA5AC8E720';
    select.dispatchEvent(new Event('change'));

    expect(emitSpy).toHaveBeenCalledWith('ACEA5AC8E720');
  });

  it('should render empty state message when readings array is empty', () => {
    component.readings = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('DASHBOARD.NO_READINGS');
  });
});

