require("dotenv").config();
var apiKeys = require("./keys.js");
console.log(apiKeys);

var liriQuery = process.argv[2];
var searchItem = "";

if (process.argv[3] != undefined) {
    for (i = 3; i < process.argv.length; i++) {
        searchItem += process.argv[i] + " ";
    }
}

console.log(liriQuery);
console.log(searchItem);
