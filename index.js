const express = require('express');
const nunjucks = require('nunjucks');
const basicAuth = require('./lib/auth.js');
const session = require('express-session');
const { createClient } = require('redis');
const RedisStore = require("connect-redis").default;

const app = express();
const port = process.env.PORT || 3333;

// SESSION ---
let sessionOptions = {
  secret: 'bc633c7b-38e9-47b1-a851-6a132ab11ce8',
  resave: false,
  saveUninitialized: true,
};

if (process.env.NODE_ENV === 'production') {
  let redisClient = createClient({
    url: process.env.REDIS_URL
  })
  redisClient.connect().catch('There is a problem with Redis', console.error)

  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "roobottom-admin:",
  })

  sessionOptions.store = redisStore;
}
app.use(session(sessionOptions));
//end:SESSION ---

app.use(express.urlencoded({ extended: true }));
app.use(basicAuth);
app.use(express.static('public'));
app.use('/uploads', express.static('app/uploads'));


nunjucks.configure('app', {
  autoescape: true,
  express: app,
});

app.set('view engine', 'njk');

//application routes
app.get('/', (req, res) => {
  res.render('index');
});

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

app.use('/diary/process-content', require('./lib/routes/process-content.js'));

app.get('/diary/complete', (req, res) => {
  const data = req.session.data;
  res.render('diary/complete', data);
});

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



app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
