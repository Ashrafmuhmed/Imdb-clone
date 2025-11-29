const router = require('express').Router() ; 
const titlesController = require('../controllers/titles.controller') ;

router.get( '/titles' , titlesController.getTitles ) ;

router.get( '/titles/:id' , titlesController.getTitleDetails ) ;

module.exports = router ;