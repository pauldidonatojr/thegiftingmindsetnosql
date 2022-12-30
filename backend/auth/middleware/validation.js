const Joi = require("joi");

function validateComment(comment) {
  const schema = Joi.object({
    comment: Joi.string(),
  });
  const result = schema.validate(comment);
  console.log(result);
  return result;
}

function validateItem(item) {
  const schema = Joi.object({
    itemName: Joi.string().required(),
    price: Joi.number().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string().required(),
  });

  const result = schema.validate(item);
  console.log("VAlidated Add Item");
  console.log(result);
  return result;
}

function validateLogin(credentials) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(credentials);
  console.log(result);
  return result;
}

function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    contact: Joi.string().required(),
    role: Joi.string().required(),
  });

  const result = schema.validate(user);
  console.log(result);
  return result;
}

function validateEmail(email) {
  const schema = Joi.object({
    email: Joi.string().email(),
  });

  const result = schema.validate(email);
  return result;
}

function validateRestaurant(restaurant) {
  const schema = Joi.object({
    ownerName: Joi.string().required(),
    restaurantName: Joi.string().required(),
    contact: Joi.string().required(),
    category: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
  });
  const result = schema.validate(restaurant);
  console.log(result);
  return result;
}

exports.validateUser = validateUser;
exports.validateRestaurant = validateRestaurant;
exports.validateLogin = validateLogin;
exports.validateItem = validateItem;
exports.validateComment = validateComment;
exports.validateEmail = validateEmail;
