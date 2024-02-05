"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//Workout class //////////////////////////////////////////////////////////////
class Workout {
  date = new Date();
  id = (new Date() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
//Running class //////////////////////////////////////////////////////////////
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.place = this.duration / this.distance;
    return this.place;
  }
}

//Cycling class //////////////////////////////////////////////////////////////
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
  }
}

//App class //////////////////////////////////////////////////////////////////
class App {
  #map;
  #eventMap;

  constructor() {
    this._getPosition();

    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleElevationField);
  }

  /////////////////////////////////////////////
  //////// _getPosition
  /////////////////////////////////////////////
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("could not position");
        }
      );
    }
  }

  /////////////////////////////////////////////
  //////// _loadMap
  /////////////////////////////////////////////
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    console.log(this);
    this.#map = L.map("map").setView([latitude, longitude], 10);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  /////////////////////////////////////////////
  //////// _showForm
  /////////////////////////////////////////////
  _showForm(mapE) {
    this.#eventMap = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  /////////////////////////////////////////////
  //////// _toggleElevationField
  /////////////////////////////////////////////
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  /////////////////////////////////////////////
  //////// _newWorkout
  /////////////////////////////////////////////
  _newWorkout(e) {
    e.preventDefault();

    // Clearing input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    // Display markup
    const { lat, lng } = this.#eventMap.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("wokrout")
      .openPopup();
  }
}

const app = new App();
