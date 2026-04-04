const jwt = require("jsonwebtoken");
const config = require("../config/env");

const generateAccessToken = (userId) => {
  const token = jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  return token;
};

const generateRefreshToken = (userId) => {
  const token = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return token;
};

const verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
