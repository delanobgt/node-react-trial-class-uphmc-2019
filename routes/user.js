const router = require("express").Router();

const controller = require("../controllers/user");
const { requireAuth, hasRole } = require("../middlewares/auth");

router.get("/self/checkAuthToken", requireAuth, (req, res) =>
  res.json({ success: true })
);
router.get("/self/profile", requireAuth, controller.getSelfProfile);
router.put("/self/email", requireAuth, controller.updateSelfEmail);
router.put("/self/password", requireAuth, controller.updateSelfPassword);

// Forget Password
router.post(
  "/password/sendForgetEmail",
  controller.sendForgetUserPasswordEmail
);
router.put(
  "/:userId/password",
  controller.checkResetUserPasswordToken,
  controller.updateUserPasswordById
);
router.post(
  "/:userId/password/checkResetToken",
  controller.checkResetUserPasswordToken,
  (req, res) => res.json({ success: true })
);

// User
router.post("/", requireAuth, hasRole("SUPER_ADMIN"), controller.createUser);
router.get("/", requireAuth, hasRole("SUPER_ADMIN"), controller.getUsers);
router.get(
  "/roles",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.getAllRoles
);
router.get(
  "/:userId",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.getUserById
);
router.put(
  "/:userId",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.updateUserById
);
router.delete(
  "/:userId",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.deleteUserById
);
router.post(
  "/:userId/password/reset",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.resetUserPasswordById
);

module.exports = router;
