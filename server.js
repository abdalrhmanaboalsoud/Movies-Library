//1. require express framework 
const express = require('express');
const axios = require('axios');
// const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT;
const apiKey = process.env.API_KEY;
const moviesData = require('./Movie Data/data.json')

// 2. invoke express
const app = express();

//3. Routes
app.get('/favoritePage', favoritePageHandler);
app.get('/', movieDetails);
app.get('/trending', trendingPageHandler);
app.get('/searchMovie', searchHandler);
app.get('/trendingTvShows', trendTvShows);
app.get('/tvgenres', tvShowsGenres);

//4. functions 
function favoritePageHandler(req, res) {
    res.send("Welcome to Favorite Page");
}
function movieDetails(req, res) {
    let opjMovie = {
        title: moviesData["title"],
        posterPath: moviesData["poster_path"],
        overview: moviesData["overview"]
    };
    res.send(opjMovie);
}
function trendingPageHandler(req, res) {
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            // console.log(result.data.results);
            let trendingDataShaped = result.data.results.map(movie => {
                return new Trend(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            })
            res.json(trendingDataShaped);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        })
}
function trendTvShows(req, res) {
    let url = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            let trendingShowShaped = result.data.results.map(show => {
                return new Show(show.id, show.name, show.first_air_date, show.poster_path, show.overview);
            })
            res.json(trendingShowShaped);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        })
}
function searchHandler(req, res) {
    let reqMovie = req.query.title;
    let url = `https://api.themoviedb.org/3/search/movie?query=${reqMovie}&api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            let response = result.data.results;
            res.json(response);
        })
        .catch(error => {
            res.status(500).send('Internal Server Error');
        })
}
function tvShowsGenres(req, res) {
    let url = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            // console.log(result);
            let genreList = result.data.genres.map(genre => {
                return { id: genre.id, name: genre.name };
            })
            res.json(genreList);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        })
}
// Constructors
function Trend(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

function Show(id, name, first_air_date, poster_path, overview) {
    this.id = id;
    this.name = name;
    this.first_air_date = first_air_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});











//3. run server make it lis
app.listen(port, () => {
    console.log(`my app is running and  listening on port ${port}`)
})