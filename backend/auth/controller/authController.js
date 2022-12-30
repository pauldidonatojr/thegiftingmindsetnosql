const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { Customer } = require("../models/customer");
const { Account } = require("../models/account");
const { Restaurant } = require("../models/restaurant");
const {
  validateUser,
  validateRestaurant,
  validateLogin,
} = require("../middleware/validation");

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  // console.log("This is oauth2Client before setting credentials", oauth2Client);

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });
  // console.log("This is oauth2Client after setting credentials", oauth2Client);

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to crete access token");
        console.log("Error in promise");
        console.log("Token", token);
      }
      resolve(token);
    });
  });

  // console.log("Access Token", accessToken);

  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_URL,
    // port: 587,
    // secure: "false",
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,

      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

const sendEmail = async (mailOptions) => {
  let emailTransporter = await createTransporter();
  // console.log("Email Transporter", emailTransporter);
  await emailTransporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(`mail sent ${info.response}`);
    }
  });
};

// API for login
exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);

  if (error) return res.status(400).send("Enter data in correct form.");

  const { email, password } = req.body;

  const loadedAccount = await Account.findOne({
    email: email,
  });

  if (!loadedAccount)
    return res.status(404).json({ message: "Account not found" });

  let hashedPassword = await bcrypt.compare(password, loadedAccount.password);
  console.log("Hashed Pass", hashedPassword);
  console.log("Loaded", loadedAccount.password);
  console.log("Passwo", password);

  if (!hashedPassword)
    res.status(404).json({ message: "Invalid Email Or Password" });

  // if (password !== loadedAccount.password)
  //   return res.status(404).send("Invalid Email or password");

  const token = jwt.sign({ accountId: loadedAccount._id.toString() }, "myKey");

  const loadedCustomer = await Customer.findOne({
    account: loadedAccount._id,
  });

  const loadedRestaurant = await Restaurant.findOne({
    account: loadedAccount._id,
  });

  if (!token) {
    return res.status(400).json({
      message: "Token is empty",
      data: token,
    });
  }

  if (loadedAccount.isVerified !== true) {
    console.log("Account is not verified");
    return res.status(401).json({
      message: "Verify email",
    });
  } else {
    console.log("In else statement checking role of user.");
    if (loadedAccount.role === "restaurant") {
      return res.status(200).json({
        token: token,
        role: loadedAccount.role,
        id: loadedAccount._id,
        restaurant: loadedRestaurant,
        email: loadedAccount.email,
      });
    } else if (loadedAccount.role === "customer") {
      return res.status(200).json({
        token: token,
        role: loadedAccount.role,
        id: loadedAccount._id,
        customer: loadedCustomer,
        email: loadedAccount.email,
      });
    }
  }
};

// APi for restaurant sign up
exports.signupRestaurant = async (req, res) => {
  const { error } = validateRestaurant(req.body);

  if (error) return res.status(400).send("Enter data correctly");

  const {
    ownerName,
    restaurantName,
    contact,
    category,
    address,
    email,
    password,
    role,
  } = req.body;

  const user = await Account.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log("This is error", err);
    } else {
      console.log("This is user ", user);
    }
  });

  if (user === null) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    let newAccount = new Account({
      email: email,
      password: hashedPassword,
      role: role,
      accountVerifyToken: verificationToken,
    });

    await newAccount
      .save()
      .then((savedAccount) => {
        console.log("Account has been registered", savedAccount);
      })
      .catch((err) => {
        console.log("Account not saved", err);
      });

    let newRestaurant = new Restaurant({
      ownerName: ownerName,
      restaurantName: restaurantName,
      contact: contact,
      category: category,
      address: address,
      account: newAccount._id,
    });

    const mailOptions = {
      to: email,
      from: "Magic Meal",
      subject: "Verify your account",
      html: `<p>Please verify your email by clicking on the link below - Eatsabyte</p>
    <p>Click this <a href="https://magicmeal.herokuapp.com/auth/verify/${verificationToken}">link</a> to verify your account.</p>
    `,
    };
    await newRestaurant
      .save()
      .then((savedRestaurant) => {
        sendEmail(mailOptions);
        res.status(200).json({
          message: "Saved Restaurant and email sent for verification",
          data: savedRestaurant,
        });
      })
      .catch((err) => {
        console.log("Customer could not be saved.", err);
        return res.status(500).json({
          message: "Could not save Restaurant.",
        });
      });
  } else {
    const restaurantData = await Restaurant.findOne({ account: user._id });
    console.log("Restaurant Data ", restaurantData);

    const restaurantContact = restaurantData.contact;
    console.log("Restaurant Conatct ", restaurantContact);

    if (user || restaurantContact === contact) {
      console.log("Restaurant already exists with this data");
      return res.status(404).json({
        message: "Restaurant already exists with this data",
      });
    }
  }
};

// API for customer sign up
exports.signupCustomer = async (req, res) => {
  const { error } = validateUser(req.body);

  if (error) return res.status(400).send("Enter data correctly");

  const { firstName, lastName, contact, email, password, role } = req.body;

  const user = await Account.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log("This is error", err);
    } else {
      console.log("This is user ", user);
    }
  });

  if (user === null) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    let newAccount = new Account({
      email: email,
      password: hashedPassword,
      role: role,
      accountVerifyToken: verificationToken,
    });

    await newAccount
      .save()
      .then((savedAccount) => {
        console.log("Account has been registered", savedAccount);
        // res.status(200).json({
        //   messgae: "Account registered",
        //   savedAccount: savedAccount,
        // });
      })
      .catch((err) => {
        if (err) {
          console.log("Account not saved, inside catch block");
          return res.status(400).json({
            message: "Account not saved inside catch block",
            error: err,
          });
        } else {
          console.log("Server Error");
          return res.status(500).json({
            message: "Server Error",
          });
        }
      });

    let newCustomer = new Customer({
      firstName: firstName,
      lastName: lastName,
      contact: contact,
      account: newAccount._id,
    });

    const mailOptions = {
      to: email,
      from: "Magic Meal",
      subject: "Verify your account",
      html: `<p>Please verify your email by clicking on the link below - Eatsabyte</p>
    <p>Click this <a href="https://magicmeal.herokuapp.com/auth/verify/${verificationToken}">link</a> to verify your account.</p>
    `,
    };

    await newCustomer
      .save()
      .then((savedCustomer) => {
        sendEmail(mailOptions);

        return res.status(200).json({
          message: "Saved Customer",
          data: savedCustomer,
        });
      })
      .catch((err) => {
        console.log("Customer could not be saved.", err);
        if (err) {
          return res.status(400).json({
            message: "Could not save customer.",
            error: err,
          });
        } else {
          console.log("Server Error");
          return res.status(500).json({
            message: "Server Error",
          });
        }
      });
  } else {
    const userData = await Customer.findOne({ account: user._id });
    const userContact = userData.contact;
    // console.log("Customer Conatct ", userContact);

    if (user || userContact === contact) {
      console.log("User already exists with this data");
      return res.status(404).json({
        message: "User already exists with this data",
      });
    }
  }
};

// API for verification of account
exports.verifyAccount = (req, res, next) => {
  const token = req.params.verificationToken;
  console.log("This is the verification token", token);
  Account.findOne({
    accountVerifyToken: token,
  })
    .then((account) => {
      if (!account) {
        const error = new Error(
          "Token in the url is tempered, don't try to fool me!"
        );
        error.statusCode = 403;
        throw error;
      }
      account.isVerified = true;
      account.accountVerifyToken = undefined;
      return account.save();
    })
    .then((account) => {
      res.json({ message: "Account verified successfully." });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

// API for reseting password
exports.resetPassword = async (req, res) => {
  console.log("Inside reset password API");

  const { email } = req.body;
  const { error } = validateEmail(req.body);

  if (error) {
    console.log("Enter email in correct format", error);

    return res.json({
      message: "Enter email in correct format",
    });
  }

  Account.findOne({ email: email })
    .then(async (account) => {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      console.log("New Hashed password", hashedPassword);
      const mailOptions = {
        to: email,
        from: "Magic Meal",
        subject: "Your new password",
        html: `<p>Your new password is ${randomPassword}. Use it to login to your account</p>`,
      };

      account.password = hashedPassword;
      console.log("About to reset password");
      account.save();
      console.log("Passowrd reset successful");
      console.log("New account object", account);
      sendEmail(mailOptions);
      return res.status(200).json({
        message:
          "If we find an account with your email then you will receive a new password via email.",
      });
    })
    .catch((error) => {
      if (error) {
        console.log("Error in catch block");
        return res.json({ message: "Something went wrong", error: error });
      } else {
        return res.json({
          message: "Internal server error",
        });
      }
    });
};
