export type City = {
  city_id: number
  city_name: string
  state_code: string
  country_code: string
  country_full: string
  lat: number
  lon: number
}

export type WeatherApiWeather = {
  id: number
  main: string
  description: string
  icon: string
}

export type WeatherApiDay = {
  dt: number
  sunrise: number
  sunset: number
  moonrise: number
  moonset: number
  moon_phase: number
  temp: {
    day: number
    min: number
    max: number
    night: number
    eve: number
    morn: number
  }
  feels_like: {
    day: number
    night: number
    eve: number
    morn: number
  }
  pressure: number
  humidity: number
  dew_point: number
  wind_speed: number
  wind_deg: number
  wind_gust: number
  weather: WeatherApiWeather[]
  clouds: number
  pop: number
  uvi: number
}

export type WeatherApiHour = {
  dt: number
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  uvi: number
  clouds: number
  visibility: number
  wind_speed: number
  wind_deg: number
  wind_gust: number
  weather: WeatherApiWeather[]
  pop: number
}

export type WeatherApiData = {
  daily: WeatherApiDay[]
  hourly: WeatherApiHour[]
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
}
