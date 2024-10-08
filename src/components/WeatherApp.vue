<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { fromUnixTime } from 'date-fns/fromUnixTime'
import { format } from 'date-fns/format'

import type { City, WeatherApiData } from '@/types/weather'

import { getFavoritedCities, getWeatherByCity, getCities } from '@/services/weather'

const favoritedCities = ref<City[]>([])
const currentCity = ref<City | null>(null)
const weatherData = ref<WeatherApiData | null>(null)
const showLoadingWeatherError = ref(false)
const isSearchedCity = ref(false)
const loadingWeatherData = ref(false)

async function getWeather() {
  loadingWeatherData.value = true
  showLoadingWeatherError.value = false

  try {
    weatherData.value = await getWeatherByCity(currentCity.value)
  } catch (error) {
    showLoadingWeatherError.value = true
  }

  loadingWeatherData.value = false
}

// Formatting
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

function getIconUrl(iconId: string) {
  return `https://openweathermap.org/img/wn/${iconId}.png`
}

// Search
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const showSearchInput = ref(false)
const citySearchValue = ref('')
const cities = ref<City[]>([])

function citySelection(city: City, searched = false) {
  isSearchedCity.value = searched
  cities.value = []
  currentCity.value = city
  citySearchValue.value = ''
  toogleSearchInput(false)

  getWeather()
}

function toogleSearchInput(value: boolean) {
  showSearchInput.value = value

  if (showSearchInput.value) {
    searchInput?.value?.focus()
  } else {
    citySearchValue.value = ''
    cities.value = []
  }
}

async function searchCities() {
  try {
    cities.value = []

    if (citySearchValue.value.length < 3) return

    cities.value = await getCities(citySearchValue.value)
  } catch (error) {
    showLoadingWeatherError.value = true
  }
}

function handleSearchInput(event: Event) {
  const input = event.target as HTMLInputElement
  citySearchValue.value = input.value

  searchCities()
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
      <div class="header__container">
        <div class="header__title">Simple Weather</div>

        <div class="header__search-container">
          <div v-if="currentCity && isSearchedCity" class="searched__city">
            {{ currentCity?.city_name }}
          </div>
          <i class="material-icons" @click="toogleSearchInput(!showSearchInput)">search</i>
          <input
            :class="{ show: showSearchInput, closed: !showSearchInput }"
            ref="searchInput"
            type="text"
            :value="citySearchValue"
            @input="handleSearchInput"
          />
          <div class="search__container">
            <div
              v-for="(city, index) in cities"
              :key="index"
              class="search__city"
              @click="citySelection(city, true)"
            >
              {{ city.city_name }}
            </div>
          </div>
        </div>
      </div>

      <div class="cities__labels">
        <a
          v-for="(city, index) in favoritedCities"
          :key="index"
          class="cities__label"
          :class="{ active: city.city_id === currentCity?.city_id }"
          @click.prevent="citySelection(city)"
        >
          {{ city.city_name.toUpperCase() }}
        </a>
      </div>
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
          <div class="city-hourly-weather__list scrollbar">
            <div
              v-for="(hour, index) in weatherData.hourly.slice(0, 8)"
              :key="index"
              class="city-hourly-weather__list__item"
            >
              <div class="hourly-weather__item__temperature">{{ Math.floor(hour.temp) }}º</div>
              <div class="hourly-weather__item__humidity">{{ hour.humidity }}%</div>
              <div class="hourly-weather__item__icon">
                <img :src="getIconUrl(hour.weather[0].icon)" />
              </div>
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
              <div class="daily-weather__item__icon">
                <img :src="getIconUrl(day.weather[0].icon)" />
              </div>
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
.header__container {
  display: flex;
  justify-content: space-between;
  padding: 24px 1rem;
  color: #fff;
  font-size: 1.2rem;
  background-color: #1565c0;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);

  .header__title {
    font-weight: bold;
    font-size: 24px;
  }
}

.cities__labels {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.cities__label {
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #666;

  &.active {
    border-bottom: 2px solid #b85f1c;
    color: #111;
  }

  &:hover {
    cursor: pointer;
    color: #1565c0;
  }
}

.city-hourly-weather__container,
.city-daily-weather__container {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin-bottom: 1rem;
  min-height: 200px;
  width: 100%;
  max-width: 400px;
  box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.2);
}

.loader,
.no-data,
.loading-error {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  height: 100%;
  width: 100%;
  color: #888;
  font-weight: 500;
  font-size: 20px;
}

.city-hourly-weather__title,
.city-daily-weather__title {
  font-weight: 500;
  font-size: 24px;
  padding: 20px 16px 12px;
  border-bottom: 1px solid #eee;
}

.city-hourly-weather__list {
  display: flex;
  flex-direction: row;
  overflow-x: auto;

  padding: 0.25rem;
}

.weather__item__icon {
  height: 20px;
  width: 100%;
  background-repeat: no-repeat;
}

.city-hourly-weather__list__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  min-width: 80px;

  &:last-child {
    .hourly-weather__item__icon,
    .hourly-weather__item__humidity {
      border-right: none;
    }
  }

  div {
    padding: 0.25rem;
  }
}

.hourly-weather__item__temperature {
  font-weight: 700;
}

.hourly-weather__item__humidity {
  color: #1d9ccb;
  text-align: center;
  width: 100%;
  border-right: 1px solid #eee;
}

.hourly-weather__item__icon {
  height: 35px;
  width: 100%;
  border-right: 1px solid #eee;
}

.hourly-weather__item__icon,
.daily-weather__item__icon {
  img {
    object-position: center;
    width: 100%;
    height: 100%;
    object-fit: none;
    zoom: 1.1;
  }
}

.hourly-weather__info__time {
  color: #888;
  font-weight: 500;
}

.city-daily-weather__list {
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0;
}

.city-daily-weather__list__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px 10px;
  border-bottom: 1px solid #eee;
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }
}

.daily-weather__item__icon {
  height: 35px;
  width: 45px;
}

.daily-weather__item__temperatures {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.daily-weather__item__info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .daily-weather__info__title {
    font-size: 20px;
    font-weight: 500;
    line-height: 24px;
  }

  .daily-weather__info__subtitle {
    font-size: 14px;
    font-weight: 500;
    color: #999;
    text-align: center;

    &::first-letter {
      text-transform: capitalize;
    }
  }
}

.daily-weather__item__temperatures {
  display: flex;
  width: 80px;
  justify-content: space-between;
}

.header__search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  i {
    cursor: pointer;

    &:hover {
      color: yellow;
    }
  }

  input {
    display: block;
    border: 0;
    border-bottom: 1px solid #d9d9d9;
    font-size: 16px;
    background-color: transparent;
    padding: 0 0 2px;
    margin: 0;
    width: 0px;
    color: #d9d9d9;
    transition: width 0.5s ease-in-out;

    &.show {
      width: 250px;
      transition: width 0.5s ease-in-out;
      padding: 0 4px 2px;
    }

    &:focus {
      outline: none;
    }
  }

  .search__container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.2);
    position: absolute;
    top: 30px;
    left: 30px;
    width: 264px;

    .search__city {
      padding: 8px;
      color: #666;

      &:hover {
        color: #1565c0;
        cursor: pointer;
      }
    }
  }
}
</style>
