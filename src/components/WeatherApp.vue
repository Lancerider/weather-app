<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fromUnixTime } from 'date-fns/fromUnixTime'
import { format } from 'date-fns/format'

import type { City, WeatherApiData } from '@/types/weather'

import { getFavoritedCities, getWeatherByCity } from '@/services'

const favoritedCities = ref<City[]>([])
const currentCity = ref<City | null>(null)
const weatherData = ref<WeatherApiData | null>(null)
const showLoadingWeatherError = ref(false)
const loadingWeatherData = ref(false)

async function getWeather() {
  loadingWeatherData.value = true
  showLoadingWeatherError.value = false

  try {
    weatherData.value = await getWeatherByCity(currentCity.value?.coord)
  } catch (error) {
    showLoadingWeatherError.value = true
  }

  loadingWeatherData.value = false
}

function citySelection(city: City) {
  currentCity.value = city
  getWeather()
}

function timeFormat(unixTime: number) {
  return fromUnixTime(unixTime)
}

function getHour(unixTime: number) {
  const date = timeFormat(unixTime)

  return format(date, 'hh:mm aa')
}

function getDayAndMonth(unixTime: number) {
  const date = timeFormat(unixTime)

  return format(date, 'iii, LLL d')
}

onMounted(async () => {
  favoritedCities.value = await getFavoritedCities()
  currentCity.value = favoritedCities.value[0] || null

  getWeather()
})
</script>

<template>
  <div class="app__container">
    <div class="app__header">
      <div class="header__title">Simple Weather</div>
      <div class="header_search-icon">
        <i class="material-icons">search</i>
      </div>
    </div>

    <div class="cities__labels">
      <a
        v-for="(city, index) in favoritedCities"
        :key="index"
        class="cities__label"
        :class="{ active: city.id === currentCity?.id }"
        @click.prevent="citySelection(city)"
      >
        {{ city.name.toUpperCase() }}
      </a>
    </div>
    <div class="app__body">
      <div v-if="showLoadingWeatherError && !weatherData" class="loading-error">
        Something went wrong, try again
      </div>

      <div class="city-hourly-weather__container">
        <div class="city-hourly-weather__title">Next hours</div>

        <div v-if="loadingWeatherData" class="loader">Loading...</div>
        <div v-if="!weatherData && !loadingWeatherData" class="no-data">No Data</div>

        <template v-if="weatherData && !loadingWeatherData">
          <div class="city-hourly-weather__list">
            <div
              v-for="(hour, index) in weatherData.hourly.slice(0, 8)"
              :key="index"
              class="city-hourly-weather__list__item"
            >
              <div class="hourly-weather__item__temperature">{{ Math.floor(hour.temp) }}º</div>
              <div class="hourly-weather__item__humidity">{{ hour.humidity }}%</div>
              <div class="hourly-weather__item__icon">{{ hour.weather[0].main }}</div>
              <div class="hourly-weather__info__time">
                {{ getHour(hour.dt) }}
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="city-daily-weather__container">
        <div class="city-daily-weather__title">Next 5 days</div>

        <div v-if="!weatherData && !loadingWeatherData" class="no-data">No Data</div>
        <div v-if="loadingWeatherData" class="loader">Loading...</div>

        <template v-if="weatherData && !loadingWeatherData">
          <div class="city-daily-weather__list">
            <div
              v-for="(day, index) in weatherData.daily.slice(0, 5)"
              :key="index"
              class="city-daily-weather__list__item"
            >
              <div class="daily-weather__item__icon">{{ day.weather[0].main }}</div>
              <div class="daily-weather__item__info">
                <div class="daily-weather__info__title">
                  {{ getDayAndMonth(day.dt) }}
                </div>
                <div class="daily-weather__info__subtitle">
                  {{ day.weather[0].description }}
                </div>
              </div>
              <div class="daily-weather__item__temperatures">
                <span> {{ Math.floor(day.temp.max) }}º </span>
                <span> {{ Math.floor(day.temp.min) }}º </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="app__footer">Last updated on Oct31 15:32</div>
  </div>
</template>

<style lang="scss">
.cities__labels {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: #fff;
}

.cities__label {
  padding: 0.75rem 1rem;

  &.active {
    border-bottom: 2px solid #b85f1c;
  }

  &:hover {
    cursor: pointer;
    background-color: rgb(248, 252, 179);
  }
}

.city-hourly-weather__container,
.city-daily-weather__container {
  background-color: #fff;
  padding: 1rem;
  margin-bottom: 1rem;
  min-height: 100px;
  width: 100%;
  max-width: 380px;
  box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.2);
}

.loader,
.no-data,
.loading-error {
  text-align: center;
}

.city-hourly-weather__title,
.city-daily-weather__title {
  font-size: 1.25rem;
  padding: 0.5rem;
}

.city-hourly-weather__list {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 0.25rem;
}

.city-hourly-weather__list__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  min-width: 80px;

  div {
    padding: 0.25rem;
  }
}

.city-daily-weather__list {
  display: flex;
  flex-direction: column;
}

.city-daily-weather__list__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
}

.daily-weather__item__temperatures {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}
</style>
