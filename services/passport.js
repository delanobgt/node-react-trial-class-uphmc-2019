const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local");
const db = require("../models");

// Create local strategy
const localOptions = {
  usernameField: "email"
};
const localLogin = new LocalStrategy(
  localOptions,
  async (email, password, done) => {
    try {
      const foundUser = await db.User.findOne({ email });
      if (!foundUser) return done("Invalid email or password!", false);
      if (!foundUser.password) return done("Password not set.", false);
      if (foundUser.banned) return done("Account is banned!", false);
      if (!(await foundUser.comparePassword(password)))
        return done("Invalid email or password!", false);
      return done(null, foundUser);
    } catch (error) {
      console.log({ error });
      done("Please try again!", false);
    }
  }
);

// Create JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: process.env.JWT_TOKEN_SECRET
};
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const foundUser = await db.User.findById(payload.userId);
    if (!foundUser) return done("Account not found!", false);
    if (foundUser.banned) return done("Account is banned!", false);

    const { authToken, password } = foundUser;
    if (!password) return done("Password not set!", false);
    if (!authToken) return done("You are not logged in!", false);
    if (authToken.value !== payload.token)
      return done("Another device has logged in with this account!", false);
    if (authToken.expiresAt < new Date().getTime())
      return done("Your session has expired!", false);
    return done(null, foundUser);
  } catch (error) {
    console.log({ error });
    done("Please login again!", false);
  }
});

passport.use(jwtLogin);
passport.use(localLogin);
