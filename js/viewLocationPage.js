// Code for the View Location page.

// Declaring variables.
var activity = false;
var summaryEl = document.getElementById("summary");
var minTempEl = document.getElementById("minTemp");
var maxTempEl = document.getElementById("maxTemp");
var humidityEl = document.getElementById("humidity");
var windSpeedEl = document.getElementById("windSpeed");
var headerBarEl = document.getElementById("headerBarTitle");
var locationIndex = JSON.parse(localStorage.getItem(APP_PREFIX + "-selectedLocation"));
var stringOfLatLngDate = ""
var toDate = new Date();
var initVal = toDate.getDate();
document.getElementById('slider').max = initVal + 4;
document.getElementById('slider').value = initVal;
document.getElementById('slider').min = initVal;

if (locationIndex !== null){
  // Use location name for header bar title.
  if (locationIndex !== 0) {
    var selectedLocation = LocationWeatherCache.locationAtIndex(locationIndex)
    headerBarEl.textContent = selectedLocation.Nickname;
    var stringOfLat = selectedLocation.Latitude;
    var stringOfLng = selectedLocation.Longitude;
    var stringOfDate = toDate.forecastDateString();
    stringOfLatLngDate = stringOfLat + ',' + stringOfLng + ',' + stringOfDate

  } else if (locationIndex === 0) {
    headerBarEl.textContent = "Current Location";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        currentLocationCallback,                                           
        function() {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
    }
  }
}

// Initialize page on load.
function initMap() {
  if (locationIndex !== 0) {
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [selectedLocation.Longitude, selectedLocation.Latitude],
      zoom: 12
    });

    var popup = new mapboxgl.Popup()
      .setHTML(selectedLocation.Nickname);

    var marker = new mapboxgl.Marker()
      .setLngLat([selectedLocation.Longitude, selectedLocation.Latitude])
      .setPopup(popup)
      .addTo(map);
      
    sliderChange(initVal)
  }
}



////// Global functions declared here:
//

// Slider to control date
function sliderChange(val) 
{
  dateIndex = val - initVal;
  var date = new Date();
  date.setDate(val);
  var dateNumber = date.getDate();
  
  if (dateIndex === 0) {
    string = "Today";
  } else if (dateIndex === 1) {
    string = "Tomorrow";
  } else {
    string = dateIndex + " days ahead";
  }
  
  selectedLocation = LocationWeatherCache.locationAtIndex(locationIndex);
  stringOfLat = selectedLocation.Latitude;
  stringOfLng = selectedLocation.Longitude;
  stringOfDate = toDate.forecastDateString();
  stringOfLatLngDate = stringOfLat + ',' + stringOfLng + ',' + stringOfDate

  month = date.getMonth() + 1;
  document.getElementById('sliderdate').innerHTML = date.getFullYear() + "-" + month + "-" + dateNumber + 
  " (" + string + ")";
  
  loading();

  setTimeout(function() {
    weatherDisplayInfo(dateIndex,selectedLocation.Forecasts[stringOfLatLngDate][dateIndex*8])
    }, 
    500);
}


// Geolocation error handler
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function currentLocationCallback(position) {
  var pos = {
    lng: position.coords.longitude,
    lat: position.coords.latitude
  };

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 12
  });
  
  // Displays location accuracy      
  map.on('load', function() {
    map.addSource("source_location_circle", {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [pos.lng, pos.lat]
          }
        }]
      }
    });

    map.addLayer({
      "id": "locationCircle",
      "type": "circle",
      "source": "source_location_circle",
      "paint": {
        "circle-radius": {
          stops: [
            [5, 1],
            [15, 180]
          ],
          base: 2
        },
        "circle-color": "blue",
        "circle-opacity": 0.4
      }
    });
    
    map.setCenter(pos);

    if (LocationWeatherCache.locationAtIndex(locationIndex) === null) {
      LocationWeatherCache.addLocation(pos.lat, pos.lng, "Current Location")
      LocationWeatherCache.getWeatherAtIndexForDate(locationIndex,toDate,currentLocationWeatherCallback)
    }

    sliderChange(initVal)
  });

  var popup = new mapboxgl.Popup()
  .setHTML("Current Location");

  var marker = new mapboxgl.Marker()
    .setLngLat([pos.lng, pos.lat])
    .setPopup(popup)
    .addTo(map);  
}

function currentLocationWeatherCallback(index,weatherObject) {
  summaryEl.textContent = "Summary: " + capitalizeFirstLetter(weatherObject[0].weather[0].description);
  minTempEl.textContent = "Minimum temperature: " + weatherObject[0].main.temp_min + "\xB0C"
  maxTempEl.textContent = "Maximum temperature: " + weatherObject[0].main.temp_max + "\xB0C"
  humidityEl.textContent = "Humidity: " + weatherObject[0].main.humidity + "%"
  windSpeedEl.textContent = "Wind speed: " + (weatherObject[0].wind.speed*3.6).toFixed(2) + "km/h"
}

function weatherDisplayInfo(index,weatherObject) {  
  summaryEl.textContent = "Summary: " + capitalizeFirstLetter(weatherObject.weather[0].description);
  minTempEl.textContent = "Minimum temperature: " + weatherObject.main.temp_min + "\xB0C"
  maxTempEl.textContent = "Maximum temperature: " + weatherObject.main.temp_max + "\xB0C"
  humidityEl.textContent = "Humidity: " + weatherObject.main.humidity + "%"
  windSpeedEl.textContent = "Wind speed: " + (weatherObject.wind.speed*3.6).toFixed(2) + "km/h"
}

function loading() {
  summaryEl.textContent = "Summary: ..."
  minTempEl.textContent = "Minimum temperature: ..." 
  maxTempEl.textContent = "Maximum temperature: ..." 
  humidityEl.textContent = "Humidity: ..." 
  windSpeedEl.textContent = "Wind speed: ..." 
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}