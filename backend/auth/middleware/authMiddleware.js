const jwt = require("jsonwebtoken");

const { Account } = require("../models/account");

// Remember when using postman for testing the token must
//be spilted but with a frontend it should not be split
const verifyToken = (req, res) => {
  //console.log("Request header", req.headers["Authorization"]);
  const token = req.headers["authorization"];
  console.log(token);

  //console.log(token);
  if (!token) {
    console.log("Could not get header", token);
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    return error;
  }

  //const splitedToken = token.split(" ")[1];
  //console.log("Token should split here", token);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "myKey");
    console.log("Decoded token", decodedToken);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    console.log("Could not get decodedToken", decodedToken);
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }

  return decodedToken.accountId;
};

exports.verifyRestaurant = async (req, res, next) => {
  const accountId = verifyToken(req, res);
  console.log("Account id of restaurant", accountId);
  await Account.findById(accountId)
    .then((account) => {
      if (!account) {
        const error = new Error("Internal server error");
        error.statusCode = 500;
        throw error;
      }
      if (account.role !== "restaurant") {
        const error = new Error("Forbidden Access");
        error.statusCode = 403;
        throw error;
      }
      req.loggedInUserId = accountId;
      next();
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.verifyCustomer = async (req, res, next) => {
  const accountId = verifyToken(req, res);
  await Account.findById(accountId)
    .then((account) => {
      if (!account) {
        const error = new Error("Internal server error");
        error.statusCode = 500;
        throw error;
      }
      if (account.role !== "customer") {
        const error = new Error("Forbidden Access");
        error.statusCode = 403;
        throw error;
      }
      req.loggedInUserId = accountId;
      next();
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
