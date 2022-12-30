const app = require("express");
const router = app.Router();
const multer = require("multer");
const path = require("path");

// this create a path like './uploads/'
//const uploadsDir = path.resolve(__dirname, "uploads");
//const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const itemController = require("../controllers/itemController");
const authMiddleWare = require("../middleware/authMiddleware");

router.post(
  "/profile-image",
  // upload.single("itemImage"),
  authMiddleWare.verifyRestaurant,
  itemController.uploadRestaurantImage
);

// Update table reservation status
router.put(
  "/update-reservation-status",
  authMiddleWare.verifyRestaurant,
  itemController.updateReservationTableStatus
);

// Geeting reserved tables
router.get(
  "/get-reserved-tables/:restaurantId",
  authMiddleWare.verifyRestaurant,
  itemController.getReservedTables
);

// Adding items to menu
router.post(
  "/add-item",
  authMiddleWare.verifyRestaurant,
  // upload.single("itemImage"),
  itemController.addItem
);

// Delete items in menu
router.delete(
  "/delete-item/:itemId",
  authMiddleWare.verifyRestaurant,
  itemController.deleteItem
);

// Update items in menu
router.put(
  "/update-item/:itemId",
  authMiddleWare.verifyRestaurant,
  itemController.updateItem
);

// Get items in for specififc restaurant
router.get(
  "/get-items",
  authMiddleWare.verifyRestaurant,
  itemController.getItems
);

// Get a specific item
router.get(
  "/get-item/:itemId",
  authMiddleWare.verifyRestaurant,
  itemController.getItem
);

// Updating pending order status
router.put(
  "/update-pending-orders/:restId",
  authMiddleWare.verifyRestaurant,
  itemController.updatePendingOrders
);

// Fetching pending orders
router.get(
  "/get-pending-orders/:restId",
  authMiddleWare.verifyRestaurant,
  itemController.getPendingOrders
);

// Uploading location
router.post(
  "/upload-location",
  authMiddleWare.verifyRestaurant,
  itemController.uploadLocation
);

// Get restaurant data with mail
router.get(
  "/get-data",
  authMiddleWare.verifyRestaurant,
  itemController.getRestaurantData
);

// Get Comments Stats
router.get(
  "/getCommentStats",
  authMiddleWare.verifyRestaurant,
  itemController.getRestaurantCommentStats
);

// Get Stats
router.get(
  "/getStats",
  authMiddleWare.verifyRestaurant,
  itemController.getRestaurantStats
);

// Post Status
router.put(
  "/updateStatus",
  authMiddleWare.verifyRestaurant,
  itemController.updateStatus
);
module.exports = router;
