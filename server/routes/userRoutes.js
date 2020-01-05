const express = require("express");
const router = require("express-promise-router")();
//Controllers
const userController = require("../controllers/userController.js");
// Helpers
const { validateBody, schemas } = require("../helpers/validation");
//Passport
const passport = require("passport");

const PassportSignIn = passport.authenticate("local", { session: false });

const PassportJWT = passport.authenticate("jwt", { session: false });

const PassportGoogleToken = passport.authenticate("google-token", {
  session: false
});

const PassportFacebookToken = passport.authenticate("facebook-token", {
  session: false
});

// const PassportLinkedInToken = passport.authenticate("linkedin-token", {
//   session: false
// });
const PassportConfiguration = require("../passport");

router.get("/dashboard", PassportJWT, userController.dashboard);
router.get("/sign-out", PassportJWT, userController.signOut);
router.get("/status", PassportJWT, userController.checkAuth);

router.post(
  "/sign-up",
  validateBody(schemas.authSchema),
  userController.signUp
);

router.post(
  "/sign-in",
  validateBody(schemas.authSchema),
  PassportSignIn,
  userController.signIn
);

router.post("/oauth/google", PassportGoogleToken, userController.googleOAuth);

router.post(
  "/oauth/facebook",
  PassportFacebookToken,
  userController.facebookOAuth
);

// router.post(
//   "/oauth/linkedin",
//   PassportLinkedInToken,
//   userController.linkedinOAuth
// );

module.exports = router;
