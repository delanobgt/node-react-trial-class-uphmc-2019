const router = require("express").Router();

const controller = require("../controllers/auth");
const { requireSignIn } = require("../middlewares/auth");

router.post("/signIn", requireSignIn, controller.signIn);
router.post("/signOut", requireSignIn, controller.signOut);

module.exports = router;
