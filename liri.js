require("dotenv").config();
var request = require('request');
var chalk = require("chalk");
var moment = require("moment");
var apiKeys = require("./keys.js");

//console.log(apiKeys);
var bandsKey = apiKeys.bandsintown.key;
//console.log(bandsKey);

var nodeArgs = process.argv;
var liriQuery = nodeArgs[2];
var searchItem = "";

if (nodeArgs[3] != undefined) {
    for (i = 3; i < nodeArgs.length; i++) {
        searchItem += nodeArgs[i] + " ";
    }
    searchItem = searchItem.trim();
}

//console.log(liriQuery);
//console.log(searchItem);

switch (liriQuery) {
    case 'concert-this':
        searchBandsInTown(searchItem);
        break;
    case 'spotify-this-song':
        console.log("spotify ths");
        break;
    case 'movie-this':
        searchOmdb(searchItem);
        break;
    case 'do-what-it-says':
        console.log("do this");
        break;
    default:
        console.log("Please enter valid search command.");
}

function searchBandsInTown(artist) {
    // Querying the bandsintown api for the selected artist, the ?app_id parameter is required, but can equal anything
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + bandsKey;
    //console.log(queryURL);
    request(queryURL, function (error, response, body) {
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            // Printing the entire object to console
            var eventInfo = JSON.parse(body);
            //console.log(eventInfo.length);
            // Constructing HTML containing the artist information
            for (i = 0; i < 3 && i < eventInfo.length; i++) {
                var eventDate = moment(eventInfo[i].datetime).format("MM[/]DD[/]YY, h:mm a");
                var eventVenue = eventInfo[i].venue;
                // Empty the contents of the response
                console.log(chalk.yellow(artist) + " will be playing at " +
                    chalk.cyan(eventVenue.name) + " in " +
                    chalk.magenta(eventVenue.city) + ", " +
                    chalk.magenta(eventVenue.region) + " " +
                    chalk.magenta(eventVenue.country),
                    " on " + eventDate);
            }
        }
    });
}

function searchOmdb(movieName) {
    if (movieName === "") {
        movieName = "Mr Nobody";
    }
    // Then run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + bandsKey;
    
    // This line is just to help us debug against the actual URL.
    console.log(queryUrl);

    request(queryUrl, function (error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {
            var movieInfo = JSON.parse(body);
            // Parse the body of the site and recover just the imdbRating
            console.log("Title: " + movieInfo.Title,
                        "\nRelease Year: " + movieInfo.Year,
                        "\nIMDB Rating: " + movieInfo.Ratings[0].Value,
                        "\nRottem Tomatoes: " + movieInfo.Ratings[1].Value,
                        "\nCountry of origin: " + movieInfo.Country,
                        "\nLanguage: " + movieInfo.Language,
                        "\nActors : " + movieInfo.Actors,
                        "\nPlot: " + movieInfo.Plot); 
        }
    });
}
