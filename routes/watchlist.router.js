const router = require("express").Router();
const watchlistController = require("../controllers/watchlist.controller");

router.get("/watchlist", watchlistController.getWatchlist);

router.post("/watchlist/add", watchlistController.addToWatchlist);

router.post("/watchlist/remove", watchlistController.removeFromWatchlist);

module.exports = router;
