const router = require('express').Router();
const namesController = require("../controllers/names.controller");


router.get("/names", namesController.getNames );

router.get("/names/:id",namesController.getName );

module.exports = router;
