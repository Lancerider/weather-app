import axios from 'axios'

import { citiesData } from '@/constants/dummyData'
import type { Coordinates } from '@/types/weather'

const apiBaseURL = import.meta.env.VUE_APP_API_BASE_URL || 'https://api.openweathermap.org/data/2.5'
const apiKey = import.meta.env.VUE_APP_API_KEY || '1f89da47fe4d0be6bbbf376af70bdb58'

const weatherApi = axios.create({
  baseURL: apiBaseURL
})

export const getFavoritedCities = async () => Object.values(citiesData)

export const getWeatherByCity = async (cityCoordinates: Coordinates | undefined) => {
  if (!cityCoordinates) return null

  const { lat, lon } = cityCoordinates

  const url = `/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&units=metric&appid=${apiKey}`

  const response = await weatherApi.get(url)

  return response.data
}
