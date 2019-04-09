const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const controller = require("../controllers/configuration");

router.use(controller.ensureConfigurationExists);
router.get("/", requireAuth, controller.getConfiguration);
router.put("/", requireAuth, controller.updateConfiguration);

module.exports = router;
