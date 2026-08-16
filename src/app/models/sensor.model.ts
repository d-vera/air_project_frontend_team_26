export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';

export interface Sensor {
  id: number;
  uidSensor: string;           // Hardware MAC / Device ID (e.g. "ACEA5AC8E720")
  name: string;                // Station name (e.g. "Sensor Patio Central")
  sensorType: string;          // Default: "ESP32_AIR"
  latitude: number;            // e.g. -12.046374 (Double)
  longitude: number;           // e.g. -77.042793 (Double)
  firmwareVersion: string;     // e.g. "1.0.2"
  sensorStatus: SensorStatus;  // "ONLINE" | "OFFLINE" | "MAINTENANCE"
  lastSeen: string | null;     // ISO timestamp (e.g. "2026-08-16T15:18:00Z")
  userId: number | null;       // ID of associated user/admin
  active: boolean;             // true
  createdAt: string;
  updatedAt: string;
}

export type SensorResponse = Sensor;

export interface CreateSensorRequest {
  uidSensor: string;
  name: string;
  sensorType?: string;
  latitude: number;
  longitude: number;
  firmwareVersion?: string;
  userId?: number | null;
}

export interface UpdateSensorRequest {
  name?: string;
  sensorType?: string;
  latitude?: number;
  longitude?: number;
  firmwareVersion?: string;
  sensorStatus?: SensorStatus;
  userId?: number | null;
}
