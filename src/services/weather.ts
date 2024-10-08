import axios from 'axios'

import type { City } from '@/types/weather'

const weatherApiBaseURL =
  import.meta.env.VUE_APP_API_BASE_URL || 'https://api.openweathermap.org/data/2.5'
const apiBaseURL = import.meta.env.VUE_APP_SERVER_BASE_URL || 'http://localhost:3000'
const apiKey = import.meta.env.VUE_APP_API_KEY || '1f89da47fe4d0be6bbbf376af70bdb58'

const service = axios.create()

export const getFavoritedCities = async () => {
  const url = `${apiBaseURL}/favoritedCities`
  const response = await service.get(url)

  return response.data
}

export const getWeatherByCity = async (city: City | null) => {
  if (!city) return null

  const { lat, lon } = city
  const url = `${weatherApiBaseURL}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&units=metric&appid=${apiKey}`

  const response = await service.get(url)

  return response.data
}

export const getCities = async (keyword: string) => {
  const url = `${apiBaseURL}/cities?city_name_like=${keyword}&_limit=10`

  const response = await service.get(url)

  return response.data
}
