const router = require("express").Router();
const controller = require("../controllers/participant");
const { requireAuth, hasRole } = require("../middlewares/auth");

router.post("/", requireAuth, controller.createParticipant);
router.get("/", requireAuth, controller.getParticipants);
router.get("/:participantId", controller.getParticipantById);
router.put("/:participantId", requireAuth, controller.updateParticipantById);
router.delete("/:participantId", requireAuth, controller.deleteParticipantById);

module.exports = router;
