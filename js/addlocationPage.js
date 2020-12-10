// Code for the Add Location page

var map,geocoder,nicknameStore;
var nicknameRef = document.getElementById("labelText");
var localObject = {
  latitude: [],
  longitude: [],
  label: ""
}

mapboxgl.accessToken = 'pk.eyJ1IjoiemhldGxpIiwiYSI6ImNraWJ6eHg0NzE0b3MycnJzd3BoMGFiNXIifQ.ONls57eGuch5aJYnyFjBBQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [101.6958, 3.1466],
  zoom: 12
});

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
});

document.getElementById("locationText").appendChild(geocoder.onAdd(map))

geocoder.on('result', function(event) {
  var formatted_address = event.result.text;
  var coordinates = event.result.geometry.coordinates;
  
  localObject.latitude = coordinates[1];
  localObject.longitude = coordinates[0];
  localObject.label = formatted_address;
});

// Saves location information --> index.html
function saveLocationButton(){
  if(nicknameRef.value === ""){
    nicknameStore = localObject.label;
  }
  else {
    nicknameStore = nicknameRef.value;
  }

  for (i=1; i<LocationWeatherCache.length(); i++){
    var location1 = LocationWeatherCache.locationAtIndex(i);
    if (location1.Nickname === nicknameStore)
      {
        location.href = 'index.html';
        alert("Location or nickname already added!");
        return;
      }
  }

  LocationWeatherCache.addLocation(localObject.latitude,localObject.longitude,nicknameStore);
  saveLocations();
  location.href = 'index.html';
}