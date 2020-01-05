const passport = require("passport");

//Strategies
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const GoogleTokenStrategy = require("passport-google-token").Strategy;
const FaceBookTokenStrategy = require("passport-facebook-token");

//Config
const config = require("./config");
//User Model
const User = require("./models/userModel");

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["access_token"];
  }
  return token;
};

//JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: config.JWT_SECRET
    },
    async (payload, done) => {
      try {
        //Find the user specified in token
        const user = await User.findById(payload.sub);
        //If the user does not exist
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

//GOOGLE OAUTH STRATEGY
passport.use(
  "google-token",
  new GoogleTokenStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Access Token", accessToken);
      console.log("Refresh Token", refreshToken);
      console.log("profile", profile);
      try {
        //Check if user exists in our database
        let existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if we have someone with the same email
        existingUser = await User.findOne({
          "local.email": profile.emails[0].value
        });

        if (existingUser) {
          // We want to merge provider's data with local auth
          existingUser.methods.push("google");
          existingUser.google = {
            id: profile.id,
            email: profile.emails[0].value
          };
          await existingUser.save();
          return done(null, existingUser);
        }

        //Create New Google User
        const newUser = new User({
          methods: ["google"],
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        });
        //Saving user
        console.log("NEW USER");
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
//FACEBOOK OAUTH STRATEGY
passport.use(
  "facebook-token",
  new FaceBookTokenStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Access Token", accessToken);
      console.log("Refresh Token", refreshToken);
      console.log("profile", profile);
      try {
        //Check if user exists in our database
        let existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if we have someone with the same email
        existingUser = await User.findOne({
          "local.email": profile.emails[0].value
        });

        if (existingUser) {
          console.log("MERGING USER");
          // We want to merge provider's data with local auth
          existingUser.methods.push("facebook");
          existingUser.facebook = {
            id: profile.id,
            email: profile.emails[0].value
          };
          await existingUser.save();
          return done(null, existingUser);
        }

        //Create New Google User
        const newUser = new User({
          methods: ["facebook"],
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        });
        //Saving user
        console.log("NEW USER");
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

//Linkedin OAUTH STRATEGY
// passport.use(
//   "linkedin-token",
//   new LinkedInTokenStrategy(
//     {
//       clientID: config.linkedin.clientID,
//       clientSecret: config.linkedin.clientSecret,
//       scope: ["r_emailaddress", "r_liteprofile"]
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log("Access Token", accessToken);
//       console.log("Refresh Token", refreshToken);
//       console.log("profile", profile);
//       //   try {
//       //     //     //Check if user exists in our database
//       //     //     let existingUser = await User.findOne({ "facebook.id": profile.id });
//       //     //     if (existingUser) {
//       //     //       return done(null, existingUser);
//       //     //     }
//       //     //     // Check if we have someone with the same email
//       //     //     existingUser = await User.findOne({
//       //     //       "local.email": profile.emails[0].value
//       //     //     });
//       //     //     if (existingUser) {
//       //     //       console.log("MERGING USER");
//       //     //       // We want to merge provider's data with local auth
//       //     //       existingUser.methods.push("facebook");
//       //     //       existingUser.facebook = {
//       //     //         id: profile.id,
//       //     //         email: profile.emails[0].value
//       //     //       };
//       //     //       await existingUser.save();
//       //     //       return done(null, existingUser);
//       //     //     }
//       //     //     //Create New Google User
//       //     //     const newUser = new User({
//       //     //       methods: ["facebook"],
//       //     //       google: {
//       //     //         id: profile.id,
//       //     //         email: profile.emails[0].value
//       //     //       }
//       //     //     });
//       //     //     //Saving user
//       //     //     console.log("NEW USER");
//       //     //     await newUser.save();
//       //     //     done(null, newUser);
//       //   } catch (error) {
//       //     done(error, false, error.message);
//       //   }
//     }
//   )
// );

//Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    async (email, password, done) => {
      try {
        //Find user with email
        const user = await User.findOne({ "local.email": email });
        //if not handle it
        if (!user) {
          return done(null, false);
        }
        //If user is found check if password is correct
        const isMatch = await user.isValidPassword(password);
        //if not handle it
        if (!isMatch) {
          console.log(isMatch);
          return done(null, false);
        }
        done(null, user);
      } catch (error) {
        done(null, error);
      }
    }
  )
);
