import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
} from 'lucide-react';

export interface WeatherCodeInfo {
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export function getWeatherCodeInfo(code: number, isDay = 1): WeatherCodeInfo {
  switch (code) {
    case 0:
      return {
        description: isDay ? 'Cerah' : 'Malam Cerah',
        icon: Sun,
      };
    case 1:
      return {
        description: 'Sebagian cerah',
        icon: CloudSun,
      };
    case 2:
      return {
        description: 'Berawan sebagian',
        icon: CloudSun,
      };
    case 3:
      return {
        description: 'Mendung',
        icon: Cloud,
      };
    case 45:
    case 48:
      return {
        description: 'Berkabut',
        icon: CloudFog,
      };
    case 51:
    case 53:
    case 55:
      return {
        description: 'Gerimis',
        icon: CloudDrizzle,
      };
    case 56:
    case 57:
      return {
        description: 'Gerimis beku',
        icon: CloudSnow,
      };
    case 61:
    case 63:
    case 65:
      return {
        description: 'Hujan',
        icon: CloudRain,
      };
    case 66:
    case 67:
      return {
        description: 'Hujan beku',
        icon: CloudSnow,
      };
    case 71:
    case 73:
    case 75:
      return {
        description: 'Salju',
        icon: Snowflake,
      };
    case 77:
      return {
        description: 'Butiran salju',
        icon: Snowflake,
      };
    case 80:
    case 81:
    case 82:
      return {
        description: 'Hujan lokal',
        icon: CloudRain,
      };
    case 85:
    case 86:
      return {
        description: 'Hujan salju',
        icon: CloudSnow,
      };
    case 95:
      return {
        description: 'Badai petir',
        icon: CloudLightning,
      };
    case 96:
    case 99:
      return {
        description: 'Badai petir & hujan es',
        icon: CloudLightning,
      };
    default:
      return {
        description: 'Berawan',
        icon: Cloud,
      };
  }
}
