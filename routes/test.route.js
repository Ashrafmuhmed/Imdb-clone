const router = require('express').Router();

router.get('/' , ( req , res ) => {
    res.status(200).send("Test route is working");
})

module.exports = router;