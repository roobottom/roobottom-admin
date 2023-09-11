const request = require('supertest');
const express = require('express');
const nunjucks = require('nunjucks');
const { router } = require('../lib/routes/process-content')
const app = express();
app.use(express.json());

nunjucks.configure('app', {
  autoescape: true,
  express: app,
});

// Mock session data middleware
app.use((req, res, next) => {
  req.session = { filePaths: [
    {
      url: 'uploads/3b51b3746f9cc9cc4fc5c25d9483507d',
      filename: '3b51b3746f9cc9cc4fc5c25d9483507d',
      originalName: 'IMG_6753.jpeg',
      extension: 'jpeg'
    },
    {
      url: 'uploads/3c7fa6ad76092ee5339535dda803de02',
      filename: '3c7fa6ad76092ee5339535dda803de02',
      originalName: 'IMG_6753.jpeg',
      extension: 'jpeg'
    }
  ] };
  next();
});

app.use('/diary/content', router); // Update 'route-path' with your route path

const { expect } = require('chai');

describe('Diary Route', function() {
  it('should create a diary entry and respond with the markdown data string', function(done) {
    request(app)
      .post('/diary/content')
      .send({
        summary: 'Here\'s a summery, with "quotes"',
        date: 'last wednesday at lunchtim',
        tags: 'flibble, bob, beach:littlehampton',
        content: 'Here is some _markdown_ content',
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property('markdownDataString');
        done();
      });
  });

  // Add more tests to check validation, error handling, etc.
});
