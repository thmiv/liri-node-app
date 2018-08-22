require("dotenv").config();
var fs = require("fs");
var request = require('request');
var chalk = require("chalk");
var moment = require("moment");
var apiKeys = require("./keys.js");
var Spotify = require("node-spotify-api");
var bandsKey = 'trilogy'; //apiKeys.bandsintown.key;
var spotifyKeys = apiKeys.spotify;

var spotify = new Spotify({
    id: spotifyKeys.id,
    secret: spotifyKeys.secret
});

var nodeArgs = process.argv;
var liriQuery = nodeArgs[2];
var searchItem = "";

if (nodeArgs[3] != undefined) {
    for (i = 3; i < nodeArgs.length; i++) {
        searchItem += nodeArgs[i] + " ";
    }
    searchItem = searchItem.trim();
}

switch (liriQuery) {
    case 'concert-this':
        searchBandsInTown(searchItem);
        break;
    case 'spotify-this-song':
        searchSpotify(searchItem);
        break;
    case 'movie-this':
        searchOmdb(searchItem);
        break;
    case 'do-what-it-says':
        doIt();
        break;
    default: console.log("Please enter valid search command.");
}

function searchSpotify(song) {
    if (song === "") {
        song = "The Sign";
    }
    spotify.search({ type: 'track', query: song, market: 'US', limit: 6 }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
       var trackInfo = data.tracks.items;
       for (i = 0; i < trackInfo.length; i++) {
        console.log("Title: " + chalk.yellow(trackInfo[i].name) +
                    "\nAlbum: " + chalk.magenta(trackInfo[i].album.name) +
                    "\nArtist: " + chalk.cyan(trackInfo[i].artists[0].name) +
                    "\nPreview: " + chalk.blue(trackInfo[i].preview_url)); 

        logResponse("Title: " + trackInfo[i].name +
                    "\nAlbum: " + trackInfo[i].album.name +
                    "\nArtist: " + trackInfo[i].artists[0].name +
                    "\nPreview: " + trackInfo[i].preview_url + "\n\n");
        }
      });
}

function searchBandsInTown(artist) {
    if (artist === "") {
        artist = "STRFKR"
    }
    // Querying the bandsintown api for the selected artist
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + bandsKey;
    //console.log(queryURL);
    request(queryURL, function (error, response, body) {
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            // Printing the entire object to console
            var eventInfo = JSON.parse(body);

            for (i = 0; i < 3 && i < eventInfo.length; i++) {
                var eventDate = moment(eventInfo[i].datetime).format("MM[/]DD[/]YY, h:mm a");
                var eventVenue = eventInfo[i].venue;
                // Empty the contents of the response
                console.log(chalk.yellow(artist) + " will be playing at " +
                    chalk.cyan(eventVenue.name) + " in " +
                    chalk.magenta(eventVenue.city) + ", " +
                    chalk.magenta(eventVenue.region) + " " +
                    chalk.magenta(eventVenue.country) + " on " +
                    chalk.red(eventDate));

                logResponse(artist + " will be playing at " + eventVenue.name + " in " + eventVenue.city + ", " +
                    eventVenue.region + " " + eventVenue.country + " on " + eventDate + "\n\n");
            }
        } else {
            return console.log('Error occurred: ' + error);
        }
    });
}

function searchOmdb(movieName) {
    if (movieName === "") {
        movieName = "Mr Nobody";
    }
    // Then run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + bandsKey;

    request(queryUrl, function (error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {
            var movieInfo = JSON.parse(body);
            // Parse the body of the site and recover just the imdbRating
            console.log("Title: " + chalk.yellow(movieInfo.Title),
                "\nRelease Year: " + chalk.cyan(movieInfo.Year),
                "\nIMDB Rating: " + chalk.magenta(movieInfo.Ratings[0].Value),
                "\nRotten Tomatoes: " + chalk.magenta(movieInfo.Ratings[1].Value),
                "\nCountry of origin: " + chalk.red(movieInfo.Country),
                "\nLanguage: " + chalk.red(movieInfo.Language),
                "\nActors : " + chalk.green(movieInfo.Actors),
                "\nPlot: " + chalk.blue(movieInfo.Plot));

            logResponse("Title: " + movieInfo.Title +
                "\nRelease Year: " + movieInfo.Year +
                "\nIMDB Rating: " + movieInfo.Ratings[0].Value +
                "\nRotten Tomatoes: " + movieInfo.Ratings[1].Value +
                "\nCountry of origin: " + movieInfo.Country +
                "\nLanguage: " + movieInfo.Language +
                "\nActors : " + movieInfo.Actors +
                "\nPlot: " + movieInfo.Plot + "\n\n");
        } else {
            return console.log('Error occurred: ' + error);
        }
    });
}

function doIt() {
    var dataArr = [];
    // This block of code will read from the "random.txt" file.
    fs.readFile("random.txt", "utf8", function (error, data) {
        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
        dataArr = data.split(",");   
        switch (dataArr[0]) {
            case 'concert-this':
                searchBandsInTown(dataArr[1]);
                break;
            case 'spotify-this-song':
                searchSpotify(dataArr[1]);
                break;
            case 'movie-this':
                searchOmdb(dataArr[1]);
                break;
            default: console.log("Please enter valid search command.");
        }
    });
}

function logResponse(searchResults) {
    fs.appendFile("log.txt", searchResults, function (err) {
        // If the code experiences any errors it will log the error to the console.
        if (err) {
            return console.log(err);
        }
        //console.log("log.txt was updated!");
    });
}
