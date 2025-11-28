const router = require('express').Router();
const namesController = require("../controllers/names.controller");


router.get("/names", namesController.getNames );

router.get("/names/:id",namesController.getName );

router.get("/names/known-for/:id", namesController.getNameKnownFor );

router.get("/names/professions/:id", namesController.getNameProfessions);

module.exports = router;
