const router = require("express").Router();
const controller = require("../controllers/voteToken");
const { requireAuth } = require("../middlewares/auth");

router.post("/", requireAuth, controller.createVoteTokens);
router.post("/available", controller.isVoteTokenAvailableByValue);
router.get("/:voteTokenId/generateQRCode", controller.generateQRCodeById);
router.get("/", requireAuth, controller.getVoteTokens);
router.get("/:voteTokenId", requireAuth, controller.getVoteTokenById);
router.put("/", controller.updateVoteTokenByValue);
router.delete("/:voteTokenId", requireAuth, controller.deleteVoteTokenById);

module.exports = router;
