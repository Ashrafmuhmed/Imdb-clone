const router = require('express').Router() ; 
const titlesController = require('../controllers/titles.controller') ;

router.get( '/titles' , titlesController.getHomePage ) ;

module.exports = router ;