const passportService = require("../services/passport");
const passport = require("passport");

exports.requireAuth = passport.authenticate("jwt", { session: false });
exports.requireSignin = passport.authenticate("local", { session: false });

exports.hasRole = requiredRole => (req, res, next) => {
  const { role } = req.user;
  if (!role == requiredRole)
    return res.status(422).json({
      error: { msg: `Lack of role: ${requiredRole}!` }
    });
  next();
};
