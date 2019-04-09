const router = require("express").Router();

const controller = require("../controllers/auth");
const { requireSignin } = require("../middlewares/auth");
const { ensureConfigurationExists } = require("../controllers/configuration");

router.use(ensureConfigurationExists);
router.post("/signIn", requireSignin, controller.signIn);
router.post("/signOut", requireSignin, controller.signOut);

module.exports = router;
