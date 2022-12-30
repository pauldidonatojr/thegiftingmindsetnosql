const app = require("express");
const router = app.Router();

const publicController = require("../controllers/publicController");

router.post(
  "/subscribe-to-newsletter",
  publicController.subscribeForNewsletter
);

module.exports = router;
