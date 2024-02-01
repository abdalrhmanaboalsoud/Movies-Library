//1. require express framework 
const express = require('express')
// 2. invoke express
const app = express()
const port = 3002
const moviesData = require('./Movie Data/data.json')

app.get('/favoritePage', favoritePageHandler);

function favoritePageHandler(req, res) {
    res.send("Welcome to Favorite Page");
}



let statusFiveH = {
    "status": 500,
    "responseText": "Sorry, something went wrong"
};

let statusFourH = {
    "status": 404,
    "responseText": "Sorry, something went wrong"
};

app.get('/', movieDetails);

function movieDetails(req, res) {
    let opjMovie = {
        title: moviesData["title"],
        posterPath: moviesData["poster_path"],
        overview: moviesData["overview"]
    };
    res.send(opjMovie);
}

function errorHandler(req, res) {
    if (res.statusCode === 500) {
        res.status(500).send(statusFiveH);
    } 
    else if (res.statusCode === 404) {
        res.status(404).send(statusFourH);
    }
}

// Register the error handling middleware
app.get('/status', errorHandler);












//3. run server make it lis
app.listen(port, () => {
    console.log(`my app is running and  listening on port ${port}`)
})