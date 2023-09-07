const express = require('express');
const nunjucks = require('nunjucks');
const basicAuth = require('./lib/auth.js'); 

const app = express();

app.use(basicAuth);

nunjucks.configure('app', { //the name of the folder with the njk files
  autoescape: true,
  express: app,
});

app.set('view engine', 'njk');

app.get('/', (req, res) => {
  res.render('index');
});

// app.get('/diary', (req, res) => {
//   res.send('Diary posts overview');
// });

// app.get('/diary/new', (req, res) => {
//   res.send('New diary post form');
// });


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
