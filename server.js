//1. require express framework 
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const axios = require('axios');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

require('dotenv').config();
const port = process.env.PORT;
const apiKey = process.env.API_KEY;
const moviesData = require('./Movie Data/data.json')

const { Client } = require('pg')
//postgres://username:password@localhost:5432/darabasename
const url = process.env.DATABASE_URL;
const client = new Client(url);



//3. Routes
app.get('/favoritePage', favoritePageHandler);
app.get('/', movieDetails);
app.get('/trending', trendingPageHandler);
app.get('/searchMovie', searchHandler);
app.get('/trendingTvShows', trendTvShows);
app.get('/tvgenres', tvShowsGenres);
app.post('/addMovie', addMovieHandler);
app.get('/getMovie', getMovieHandler);
app.put('/updateComment/:movieID', updateCommentHandler);
app.delete('/deleteMovie/:movieID', deletMovieHandler);
app.get('/getSpecificMovie/:movieID', getSpecificMovieHandler);
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
//seacrh function by query
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
function addMovieHandler(req, res) {
    const { title, release_date, poster_path,overview, comment } = req.body;
    const sql = `INSERT INTO movie (title, release_date, poster_path,overview, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const safeValues = [title, release_date, poster_path,overview, comment];
    client.query(sql, safeValues).then(result => {
        res.status(201).send(result.rows);
    })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        })

};
function getMovieHandler(req, res) {
    const sql = `SELECT * FROM movie`;
    client.query(sql).then(result => {
        res.json(result.rows);
    })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        })
}
function updateCommentHandler(req, res) {
    let commentD = req.params.movieID;
    let { title, release_date, poster_path,overview, comment } = req.body;
    const sql = `UPDATE movie SET title = $1,  release_date = $2, poster_path = $3, overview = $4, comment = $5 WHERE id = $6 RETURNING *`;
    const values = [title, release_date, poster_path,overview, comment, commentD];
    client.query(sql, values).then(result => {

        res.json(result.rows);

    }).catch(error => {
        console.error(error);
    })
};
function deletMovieHandler(req, res) {
    let { movieID } = req.params;
    const sql = `DELETE FROM movie WHERE id = $1`;
    let values = [movieID];
    console.log(movieID);
    client.query(sql, values).then(data =>{})
    client.query(sql, values)
    .then(result => {
        
        res.status(204).send("successfuly deleted");

    }).catch(error => {
        console.error(error);
    })
}
function getSpecificMovieHandler(req, res) {
    let { movieID } = req.params;
    const sql = `SELECT * FROM movie WHERE id = $1`;
    let values = [movieID];
    client.query(sql, values)
        .then(result => {
            res.json(result.rows);
        })
        .catch();
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
client.connect().then(() => {
    app.listen(port, () => {
        console.log(`my app is running and  listening on port ${port}`)
    })
}).catch()
