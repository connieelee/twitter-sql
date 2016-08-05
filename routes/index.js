'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT tweets.id, name, content, pictureurl FROM tweets JOIN users ON users.id = userid;', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

    // var allTheTweets = tweetBank.list();
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: allTheTweets,
    //   showForm: true
    // });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT tweets.id, name, content, pictureurl FROM tweets JOIN users ON users.id = userid WHERE name = $1;', [req.params.username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', username: req.params.username, tweets: tweets, showForm: true });
    });

    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsForName,
    //   showForm: true,
    //   username: req.params.username
    // });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT tweets.id, name, content, pictureurl FROM tweets JOIN users ON users.id = userid WHERE tweets.id = $1;', [req.params.id], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;

      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    // });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query( 'SELECT id, name FROM users', function (err, result) {
      if (err) throw err;
      var users = result.rows;
      var userExists = false;
      for (var user in users) {
        // user exists, add tweet
        if (users[user].name === req.body.name) {
          userExists = true;
          client.query('INSERT INTO tweets(userid, content) VALUES ($1, $2)', [users[user].id, req.body.content], function (err, result) {
            if (err) return next(err);
          });
        }
      }

      // user doesn't exist, insert user before inserting tweet
      if (!userExists) {
        client.query("INSERT INTO users (name, pictureurl) VALUES ($1, 'https://pbs.twimg.com/profile_images/2450268678/olxp11gnt09no2y2wpsh_normal.jpeg')", [req.body.name], function(err, result) {
          if (err) return next(err);
          // var user_id = users.length + 1;
        });

        client.query("INSERT INTO tweets(userid, content) VALUES ($1, $2)", [user_id, req.body.content], function(err, result) {
          if (err) return next(err);
        });
      }
    });


    // client.query('INSERT INTO ', function (err, result) {
    //   if (err) return next(err); // pass errors to Express
    // });

    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    // io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
