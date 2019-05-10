const router = require("express").Router();
const controllers = require("../controllers/qrCode");

router.get("/generate/:payload", controllers.generateQrCode);

module.exports = router;
