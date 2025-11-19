import axios from 'axios';
import config from '../config';

type Coordinates = [number, number]; // [longitude, latitude]

type TravelMode = 'driving'  | 'transit';

export const getRouteDistance = async (
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode = 'driving'
): Promise<{
  distanceInMeters: number;
  durationInSeconds: number;
  distanceText: string;
  durationText: string;
}> => {
  const GOOGLE_MAPS_API_KEY = config.google_map_api;
console.log(GOOGLE_MAPS_API_KEY,"google map api key");
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is missing.');
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&mode=${mode}&units=metric&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.routes?.length) {
      throw new Error('No route found');
    }

    const leg = data.routes[0].legs[0];

    return {
      distanceInMeters: leg.distance.value,
      durationInSeconds: leg.duration.value,
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
    };
  } catch (error) {
    console.error('Error fetching route from Google Maps:', error);
    throw new Error('Failed to calculate route distance');
  }
};
