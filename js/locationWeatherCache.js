
// Returns a date in the format "YYYY-MM-DD".
Date.prototype.simpleDateString = function() {
    function pad(value)
    {
        return ("0" + value).slice(-2);
    }

    var dateString = this.getFullYear() + "-" + 
            pad(this.getMonth() + 1, 2) + '-' + 
            pad(this.getDate(), 2);
    
    return dateString;
}

// Date format required by forecast.io API.
// We always represent a date with a time of midday,
// so our choice of day isn't susceptible to time zone errors.
Date.prototype.forecastDateString = function() {
    return this.simpleDateString() + "T12:00:00";
}



// Code for LocationWeatherCache class

// Prefix to use for Local Storage
var APP_PREFIX = "weatherApp";

var LocationWeatherCache = new LocationWeatherCache()


function LocationWeatherCache()
{
    // Private attributes:

    var locations = [];
    locations[0] = null;
    var callbacks = {};

    // Public methods:
    
    // Returns the number of locations stored in the cache.
    //
    this.length = function() {
        return locations.length;
    };
    
    // Returns the location object for a given index.
    // Indexes begin at zero.
    //
    this.locationAtIndex = function(index) {
        return locations[index];
    };

    // Given a latitude, longitude and nickname, this method saves a 
    // new location into the cache.  It will have an empty 'forecasts'
    // property.  Returns the index of the added location.
    //
    this.addLocation = function(latitude, longitude, nickname)
    {
            var position = {
                'Latitude' : latitude,
                'Longitude' : longitude,
                'Nickname' : nickname,
                'Forecasts' : {}
                };
        if (nickname === "Current Location"){
            locations[0] = position;
        } else {    
            locations.push(position);
        }
        saveLocations();
        return LocationWeatherCache.length;
    }

    // Removes the saved location at the given index. 
    this.removeLocationAtIndex = function()
    {
        loadLocations();
        index = JSON.parse(localStorage.getItem(APP_PREFIX + "-selectedLocation"))
        if (index === 0) {
            locations[0] = null;
        } else {
            locations.splice(index,1);
        }
        saveLocations();
        location.href = "index.html";
    }

    // Converts locations array into JSON string.
    this.toJSON = function() {
        var storeLocation = {
            "newLocation" : locations
        }
        return JSON.stringify(storeLocation);
    };

    // Given a public-data-only version of the class (such as from
    // local storage), this method will initialise the current
    // instance to match that version.
    this.initialiseFromPDO = function(locationWeatherCachePDO) {
        if (locationWeatherCachePDO !== null) {
            locations = locationWeatherCachePDO.newLocation;
        }
    };

    // Request weather for the location at the given index for the
    // specified date.  'date' should be JavaScript Date instance.
    //
    // This method doesn't return anything, but rather calls the 
    // callback function when the weather object is available. This
    // might be immediately or after some indeterminate amount of time.
    // The callback function should have two parameters.  The first
    // will be the index of the location and the second will be the 
    // weather object for that location.
    // 
    this.getWeatherAtIndexForDate = function(index, date, callback) {
        var stringOfLatLngDate = ""
        stringOfLat = locations[index].Latitude;
        stringOfLng = locations[index].Longitude;
        stringOfDate = date.forecastDateString();
        stringOfLatLngDate = stringOfLat + ',' + stringOfLng + ',' + stringOfDate
        callbacks = {
            
            "index" : index,
            "date"  : date,
            "callback" : callback,
            "stringOfLatLngDate" : stringOfLatLngDate
        }
        
        if (locations[index].Forecasts.hasOwnProperty(stringOfLatLngDate)) {
            callback(index,locations[index].Forecasts[stringOfLatLngDate])
        } else {
            //Make API request
            
            var unitString = "&units=metric";
            var queryString = "&callback=LocationWeatherCache.weatherResponse"
            var apiKey = "&appid=4d4cce8d598978b90bc34e5b9e14ab16"
            var initUrl = "https://api.openweathermap.org/data/2.5/forecast?";
            var url = initUrl + "lat=" + stringOfLat + "&lon=" + stringOfLng + queryString + 
            unitString + apiKey;
            var script = document.createElement('script')
            
            script.src = url;
            document.body.appendChild(script);
            
            saveLocations();
        }
    };
    
    // This is a callback function passed to forecast.io API calls.
    // This will be called via JSONP when the API call is loaded.
    //
    // This should invoke the recorded callback function for that
    // weather request.
    //
    this.weatherResponse = function(response) {
        var index = callbacks.index;
        var date = callbacks.date;
        var stringOfLatLngDate = callbacks.stringOfLatLngDate;
        var callbackFunction = callbacks.callback;
        var weatherObject = response.list;
        locations[index].Forecasts[stringOfLatLngDate] = weatherObject;
        
        saveLocations();
        
        return callbackFunction(index,weatherObject)
    }

    // Private methods:
    
    // Given a latitude and longitude, this method looks through all
    // the stored locations and returns the index of the location with
    // matching latitude and longitude if one exists, otherwise it
    // returns -1.
    //
    function indexForLocation(latitude, longitude)
    {
        for (var i = 0; i < locations.length; i++)
        {
            if (locations[i].Latitude===latitude && locations[i].Longitude===longitude)
            {
                return i;
            }
            else
            {
                return -1;   
            }
        }
    }
}

// Restore the singleton locationWeatherCache from Local Storage.
function loadLocations()
{
    //var LocationWeatherCache = new LocationWeatherCache()
    var retrievedLocations = JSON.parse(localStorage.getItem(APP_PREFIX))
    
    LocationWeatherCache.initialiseFromPDO(retrievedLocations)
     
}

// Save the singleton locationWeatherCache to Local Storage.
function saveLocations()
{
    if (typeof(Storage) !== "undefined" ){
         
        localStorage.setItem(APP_PREFIX,LocationWeatherCache.toJSON());
    }
    else{
        console.log("Error: localStorage is not supported by current browser.");
    }

}

//Call loadLocation() function to restore the locations array
loadLocations();

