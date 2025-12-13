const router = require('express').Router() ; 
const titlesController = require('../controllers/titles.controller') ;

router.get( '/titles' , titlesController.getTitles ) ;

router.get( '/titles/:id' , titlesController.getTitleDetails ) ;

router.get('/top-250-movies', titlesController.getTop250Movies);

router.get('/top-250-series', titlesController.getTop250Series);

router.get('/top-episodes', titlesController.getTopEpisodes);

module.exports = router ;