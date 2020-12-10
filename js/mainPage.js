// Code for the main page (locations list).

function viewLocation(locationName)
{
    // Save the desired location to local storage
    localStorage.setItem(APP_PREFIX + "-selectedLocation", JSON.stringify(locationName)); 
    // And load the view location page.
    location.href = 'viewlocation.html';
}

function appendNewLocation(){
    // Load locations from local storage (locationWeatherCache.js)
    loadLocations();
    var location;
    var date = new Date();

    if (LocationWeatherCache.locationAtIndex(0) !== null && LocationWeatherCache.locationAtIndex(0) !== undefined) {
        
        nodeImg = document.getElementById("icon0");
        nodeSpan = document.getElementById("span0");

        //element: weather summary
        var nodeWeather = document.createElement("span")
        nodeWeather.setAttribute("id","weather0")
        nodeWeather.setAttribute("class","mdl-list__item-sub-title")
        nodeSpan.appendChild(nodeWeather);
        nodeImg.src = "images/loading.png"
        document.getElementById("weather0").textContent = "Loading.."
        location = LocationWeatherCache.locationAtIndex(0);
        var stringOfLat = location.Latitude;
        var stringOfLng = location.Longitude;
        var stringOfDate = date.forecastDateString();
        stringOfLatLngDate = stringOfLat + ',' + stringOfLng + ',' + stringOfDate
        load(0,location.Forecasts[stringOfLatLngDate])
    }

    for (i=1; i<LocationWeatherCache.length(); i++){
       
        location = LocationWeatherCache.locationAtIndex(i);
        viewLocationIndex = i;
            
        //element: li
        var node = document.createElement("li");
        node.setAttribute("class","mdl-list__item mdl-list__item--two-line")
        node.setAttribute("onclick","viewLocation("+ viewLocationIndex +")")
        
        //element: span
        var nodeSpan = document.createElement("span");
        nodeSpan.setAttribute("class","mdl-list__item-primary-content");
        node.appendChild(nodeSpan);

        //element: img
        var nodeImg = document.createElement("img")
        nodeImg.setAttribute("class","mdl-list__item-icon")
        nodeImg.setAttribute("id","icon"+i)
        nodeSpan.appendChild(nodeImg);

        //element: locationText
        var nodeText = document.createElement("span")
        nodeText.setAttribute("id","name"+i)
        nodeSpan.appendChild(nodeText);
        
        componentHandler.upgradeElement(node);
        document.getElementById("locationList").appendChild(node);
        document.getElementById("name"+i).textContent = location.Nickname

        //element: weather summary
        var nodeWeather = document.createElement("span")
        nodeWeather.setAttribute("id","weather"+i)
        nodeWeather.setAttribute("class","mdl-list__item-sub-title")
        nodeSpan.appendChild(nodeWeather);
        
        nodeImg.src = "images/loading.png"
        document.getElementById("weather"+i).textContent = "Loading.."
        LocationWeatherCache.getWeatherAtIndexForDate(i, date, load)
    }

    function load(index, callback) {
        return(
            nodeImg.src = "http://openweathermap.org/img/wn/" + callback[0].weather[0].icon + 
            "@2x.png",
            document.getElementById("weather"+index).textContent = "Max Temperature : " + callback[0].main.temp_max + 
            "\xB0C," + " Min Temperature : " + callback[0].main.temp_min + "\xB0C"
        )
    }
    
    // function currentLocation()
    
}
