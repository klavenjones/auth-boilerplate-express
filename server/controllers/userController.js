const User = require("../models/userModel.js");
const JWT = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

// //Creating a Token
const signToken = user => {
  return JWT.sign(
    {
      iss: "Auth",
      sub: user.id,
      iat: new Date().getTime(), // Current time
      exp: new Date().setDate(new Date().getDate() + 1) //Expires in 24 hourss
    },
    JWT_SECRET
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;

    // //CHECK IF EMAIL EXISTS
    let user = await User.findOne({ "local.email": email });
    if (user) {
      console.log(user);
      return res.status(409).json({ error: "User Already exists" });
    }
    // //IS THERE A OUTSIDE ACCOUNT (google, facebook, linkedin) WITH THE SAME EMAIL
    user = await User.findOne({
      $or: [
        { "google.email": email },
        { "facebook.email": email },
        { "linkedIn.email": email }
      ]
    });

    if (user) {
      // Let's merge them?
      user.methods.push("local");
      user.local = {
        email: email,
        password: password
      };
      await user.save();
      // Generate the token
      const token = signToken(user);
      // Respond with token
      res.cookie("access_token", token, {
        httpOnly: true
      });
      return res.status(200).json({ success: true });
    }

    //IF NOT REGISTER NEW USER
    const newUser = new User({
      methods: ["local"],
      local: {
        email: email,
        password: password
      }
    });

    await newUser.save();

    const token = signToken(newUser);
    res.cookie("access_token", token, {
      httpOnly: true
    });

    return res.status(201).json({ token });
  },

  signIn: async (req, res, next) => {
    // Generate Token
    const token = signToken(req.user);
    res.cookie("access_token", token, {
      httpOnly: true
    });
    return res.status(200).json({ success: req.user });
  },

  googleOAuth: async (req, res, next) => {
    // Generate token
    const token = signToken(req.user);
    res.cookie("access_token", token, {
      httpOnly: true
    });
    res.status(200).json({ success: true, token: token });
  },

  facebookOAuth: async (req, res, next) => {
    // Generate token
    const token = signToken(req.user);
    res.cookie("access_token", token, {
      httpOnly: true
    });
    res.status(200).json({ success: true, token: token });
  },

  linkedInOAuth: async (req, res, next) => {
    // Generate token
    const token = signToken(req.user);
    res.cookie("access_token", token, {
      httpOnly: true
    });
    res.status(200).json({ success: true, token: token });
  },

  dashboard: async (req, res, next) => {
    console.log("I managed to get here!");
    res.json({
      secret: "resource",
      methods: req.user.methods
    });
  },
  signOut: async (req, res, next) => {
    res.clearCookie("access_token");
    // console.log('I managed to get here!');
    res.json({ success: true });
  },

  checkAuth: async (req, res, next) => {
    console.log("I managed to get here!");
    res.json({ success: true });
  }
};
