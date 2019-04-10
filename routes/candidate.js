const router = require("express").Router();
const controller = require("../controllers/candidate");
const { upload } = require("../middlewares/upload");
const { requireAuth } = require("../middlewares/auth");

router.post(
  "/",
  requireAuth,
  upload.single("imageFile"),
  controller.createCandidate
);
router.get("/", controller.getCandidates);
router.get("/:candidateId", controller.getCandidateById);
router.put(
  "/:candidateId",
  requireAuth,
  upload.single("imageFile"),
  controller.updateCandidateById
);
router.delete("/:candidateId", requireAuth, controller.deleteCandidateById);

module.exports = router;
