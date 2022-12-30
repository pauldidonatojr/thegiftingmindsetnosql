const app = require("express");
const router = app.Router();

const authMiddleWare = require("../middleware/authMiddleware");
const testController = require("../controllers/testController");

router.post("/text-msg", testController.testMsg);

router.post("/phone-verification", testController.verifyNumber);

router.post("/reset-password", testController.resetPassword);

router.get(
  "/getCommentStats",
  authMiddleWare.verifyRestaurant,
  testController.getRestaurantCommentStats
);

router.get(
  "/getCustomerStats",
  authMiddleWare.verifyRestaurant,
  testController.getRestaurantCustomerStats
);
module.exports = router;
