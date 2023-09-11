const express = require('express');
const nunjucks = require('nunjucks');
const basicAuth = require('./lib/auth.js');
const session = require('express-session'); 
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(basicAuth);
app.use(express.static('app'));
app.use('/uploads', express.static('app/uploads'));

app.use(session({
  secret: 'bc633c7b-38e9-47b1-a851-6a132ab11ce8',
  resave: false,
  saveUninitialized: true,
}));

nunjucks.configure('app', { //the name of the folder with the njk files
  autoescape: true,
  express: app,
});

app.set('view engine', 'njk');


//application routes
app.get('/', (req, res) => {
  res.render('index');
});

//app.use('/diary-create', require('./lib/diary-create.js'));

app.get('/diary/photos', (req, res) => {
  res.render('diary/photos');
});

app.use('/diary/process-photos', require('./lib/routes/process-photos.js'));

app.get('/diary/alt', (req, res) => {
  try {
    const photos = req.session.filePaths || []; 
    res.render('diary/alt', { photos });
  } catch (error) {
    console.error('Error displaying the next screen', error);
    res.status(500).send('An error occurred');
  }
});

app.use('/diary/process-alt', require('./lib/routes/process-alt.js'));

app.get('/diary/content', (req, res) => {
  res.render('diary/content');
});

app.use('/diary/process-content', require('./lib/routes/process-content.js').router);


// app.get('/diary/new', (req, res) => {
//   res.send('New diary post form');
// });

app.use((err, req, res, next) => {
  console.error(err.stack);

  // You might want to distinguish between different error types here
  // and set the status code accordingly
  if (err.type === 'DatabaseError') {
    res.status(500);
  } else if (err.type === 'ValidationError') {
    res.status(400);
  } else {
    res.status(500);
  }

  // Send a user-friendly error message, possibly based on the error type
  res.send({
    error: {
      message: err.message || 'Something went wrong, please try again later.',
      type: err.type || 'UnknownError',
      details: err.details || null,  // potentially more detailed error info
    },
  });
});



app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
