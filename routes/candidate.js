const router = require("express").Router();
const controller = require("../controllers/candidate");
const { upload } = require("../middlewares/upload");
const { requireAuth, hasRole } = require("../middlewares/auth");

router.post(
  "/",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  upload.single("imageFile"),
  controller.createCandidate
);
router.get("/", controller.getCandidates);
router.get("/:candidateId", controller.getCandidateById);
router.put(
  "/:candidateId",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  upload.single("imageFile"),
  controller.updateCandidateById
);
router.delete(
  "/:candidateId",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.deleteCandidateById
);

module.exports = router;
