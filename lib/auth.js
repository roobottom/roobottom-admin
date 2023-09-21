require('dotenv').config();
const basicAuth = require('express-basic-auth');

// Dynamically create a users object from environment variables
const users = Object.keys(process.env)
  .filter(key => key.startsWith('USER_'))
  .reduce((userObj, key) => {
    const match = key.match(/\d+/);
    if (!match) {
      console.error(`Unable to extract index from key: ${key}`);
      return userObj;
    }

    const index = match[0];
    const user = process.env[key];
    const password = process.env[`PASSWORD_${index}`];

    if (user && password) {
      userObj[user] = password;
    } else {
      console.error(`Missing user or password for index ${index}`);
    }

    return userObj;
  }, {});

const authMiddleware = basicAuth({
  users: users,
  challenge: true,
});

module.exports = (req, res, next) => {
  if (req.path.startsWith('/images/apple-touch-icon')) {
    return next(); // Skip authentication for Apple touch icons
  }

  return authMiddleware(req, res, next); // Proceed with authentication
};
