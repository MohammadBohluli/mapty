"use strict";

// prettier-ignore

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
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    //prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
//Running class //////////////////////////////////////////////////////////////
class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

//Cycling class //////////////////////////////////////////////////////////////
class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycle1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycle1);
//App class //////////////////////////////////////////////////////////////////
class App {
  #map;
  #eventMap;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
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
    this.#map = L.map("map").setView([latitude, longitude], 13);

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
  //////// _hideForm
  /////////////////////////////////////////////
  _hideForm() {
    inputDistance.value = "";
    inputDuration.value = "";
    inputCadence.value = "";
    inputElevation.value = "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => {
      form.style.display = "grid";
    }, 1000);
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
    const validInput = (...input) =>
      input.every((inpt) => Number.isFinite(inpt));
    const allPositive = (...input) => input.every((inpt) => inpt > 0);
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#eventMap.latlng;
    let workout;

    // If workout Running, create Running object
    if (type === "running") {
      // Check if data is valid
      const cadence = +inputCadence.value;
      if (
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Input have to be positive number");
      }
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout Cycling, create Cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Input have to be positive number");
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hideform + Clearing input fields
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
          <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === "running") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === "cycling") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  /////////////////////////////////////////////
  //////// _moveToPopup
  /////////////////////////////////////////////
  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");
    console.log(workoutEl);
    // for handling null
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
