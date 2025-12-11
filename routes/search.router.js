const router = require("express").Router();
const searchController = require('../controllers/search.controller') ; 

router.get("/search", searchController.search);
router.get("/search/advanced", searchController.advancedSearch );

module.exports = router;
