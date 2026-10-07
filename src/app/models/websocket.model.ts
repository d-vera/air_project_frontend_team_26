export interface AirQualityReadingNotification {
  action: 'INSERT' | 'UPDATE';
  id: number;
  sensorUid: string;       // e.g. "ESP32_001"
  deviceName?: string;     // e.g. "Living Room"
  timestamp: string;       // ISO 8601 string: "2026-10-05T19:00:00Z"
  temperature: number;     // e.g. 23.4
  humidity: number;        // e.g. 48.2
  co2: number;             // e.g. 420.0
  pm10Small?: number;      // PM1.0
  pm25?: number;           // PM2.5
  pm10?: number;           // PM10
}

export interface SensorStatusNotification {
  sensorId: number;        // Primary key id
  uidSensor: string;       // Unique sensor hardware UID (e.g. "ESP32_001")
  name: string;            // Sensor display name
  previousStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | null;
  newStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  active: boolean;         // false if soft-deleted, true if active
  lastSeen?: string;       // ISO 8601 string: "2026-10-05T18:30:00Z"
}
