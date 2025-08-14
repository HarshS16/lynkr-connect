import citiesData from '../../cities.json';

export interface City {
  id: string;
  name: string;
  state: string;
}

// Transform the JSON data and create formatted city strings
export const cities: City[] = citiesData as City[];

// Create formatted city strings for dropdown (City, State format)
export const cityOptions = cities.map(city => `${city.name}, ${city.state}`);

// Helper function to get city object from formatted string
export const getCityFromOption = (option: string): City | null => {
  const [cityName, stateName] = option.split(', ');
  return cities.find(city => city.name === cityName && city.state === stateName) || null;
};

// Helper function to format city for display
export const formatCityDisplay = (city: City): string => {
  return `${city.name}, ${city.state}`;
};
