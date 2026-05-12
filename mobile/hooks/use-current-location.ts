import * as Location from 'expo-location';
import { useState } from 'react';

import { useToast } from '@/contexts/toast-context';

export type Coordinates = {
  lat: number;
  lng: number;
};

type CurrentLocationResult = {
  address: string;
  coordinates: Coordinates;
  placeName: string;
};

export function useCurrentLocation() {
  const { showToast } = useToast();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  async function detectCurrentLocation(): Promise<CurrentLocationResult | null> {
    setLocationError('');
    setIsDetectingLocation(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        const message = 'Izin lokasi ditolak. Kamu tetap bisa mengisi lokasi secara manual.';
        setLocationError(message);
        showToast({
          type: 'error',
          title: 'Lokasi tidak diizinkan',
          message,
        });
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const places = await Location.reverseGeocodeAsync({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      const fallbackPlace = await reverseGeocodeWithOpenStreetMap(coordinates);
      const expoPlace = places[0];

      return {
        address: formatAddress(expoPlace, coordinates, fallbackPlace?.address),
        coordinates,
        placeName: formatPlaceName(expoPlace, fallbackPlace?.placeName),
      };
    } catch {
      const message = 'Gagal mengambil lokasi saat ini. Silakan isi lokasi secara manual.';
      setLocationError(message);
      showToast({
        type: 'error',
        title: 'GPS gagal',
        message,
      });
      return null;
    } finally {
      setIsDetectingLocation(false);
    }
  }

  return {
    detectCurrentLocation,
    isDetectingLocation,
    locationError,
  };
}

type FallbackLocation = {
  address: string;
  placeName: string;
};

function formatAddress(
  place: Location.LocationGeocodedAddress | undefined,
  coordinates: Coordinates,
  fallbackAddress?: string,
) {
  if (fallbackAddress && !isCoordinateOnly(fallbackAddress)) {
    return fallbackAddress;
  }

  if (!place) {
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  }

  const firstLine = uniqueAddressParts([place.name, place.street]).join(', ');
  const secondLine = uniqueAddressParts([place.district, place.subregion, place.city]).join(', ');
  const countryLine = uniqueAddressParts([place.region, place.country]).join(', ');

  const address = [firstLine, secondLine, countryLine].filter(Boolean).join('\n');

  return address || cleanDisplayAddress(place.formattedAddress ?? '') || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
}

function formatPlaceName(place: Location.LocationGeocodedAddress | undefined, fallbackPlaceName?: string) {
  const placeName = pickSpecificPlaceName([
    fallbackPlaceName,
    place?.district,
    place?.subregion,
    place?.city,
    place?.name,
    place?.street,
    place?.region,
  ]);

  return placeName || 'Lokasi saat ini';
}

async function reverseGeocodeWithOpenStreetMap(coordinates: Coordinates): Promise<FallbackLocation | null> {
  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(coordinates.lat),
      lon: String(coordinates.lng),
      zoom: '18',
      addressdetails: '1',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.address ?? {};
    const structuredAddress = formatOpenStreetMapAddress(address);
    const displayAddress = cleanDisplayAddress(data.display_name ?? '');

    return {
      address: structuredAddress || displayAddress,
      placeName: pickSpecificPlaceName([
        data.name,
        address.amenity,
        address.building,
        address.road,
        address.village,
        address.town,
        address.city_district,
        address.district,
        address.suburb,
        address.neighbourhood,
        address.hamlet,
        address.municipality,
        address.city,
        address.county,
        address.state,
        address.state_district,
        data.name,
      ]),
    };
  } catch {
    return null;
  }
}

function isCoordinateOnly(value: string) {
  return /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(value.trim());
}

function cleanDisplayAddress(address: string) {
  return uniqueAddressParts(address.split(',')).join(', ');
}

function formatOpenStreetMapAddress(address: Record<string, string | undefined>) {
  const area = pickSpecificPlaceName([
    address.amenity,
    address.building,
    address.road,
    address.neighbourhood,
    address.hamlet,
    address.suburb,
  ]);
  const villageOrDistrict = pickSpecificPlaceName([
    address.village,
    address.town,
    address.city_district,
    address.district,
    address.municipality,
    address.city,
  ]);
  const regency = pickSpecificPlaceName([address.county, address.city]);
  const province = pickSpecificPlaceName([address.state, address.state_district]);

  return uniqueAddressParts([area, villageOrDistrict, regency, province]).join(', ');
}

function uniqueAddressParts(parts: Array<string | null | undefined>) {
  const normalizedParts = parts
    .map((part) => normalizeIndonesianAddressTypo(part?.trim()))
    .filter((part): part is string => Boolean(part));

  return normalizedParts.filter((part, index, list) => {
    const normalized = normalizeAddressPart(part);

    if (isGenericJawa(normalized)) {
      return false;
    }

    return list.findIndex((item) => normalizeAddressPart(item) === normalized) === index;
  });
}

function normalizeAddressPart(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeIndonesianAddressTypo(value: string | undefined) {
  return value?.replace(/\bKacamatan\b/gi, 'Kecamatan');
}

function pickSpecificPlaceName(candidates: Array<string | null | undefined>) {
  return (
    candidates.find((candidate) => {
      const normalized = normalizeAddressPart(candidate ?? '');

      return normalized && !isGenericJawa(normalized) && !isCoordinateOnly(candidate ?? '');
    }) ?? ''
  );
}

function isGenericJawa(normalizedValue: string) {
  return normalizedValue === 'jawa' || normalizedValue === 'java';
}
