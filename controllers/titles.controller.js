const Titles = require('../models/titles') ;
const Op = require('sequelize').Op ;
const STATUS_CODE = require('../utils/status_code') ; 


exports.getHomePage = ( req , res , next ) => {
    
    Titles.findAll({
        limit : 10 , 
        order : [['averageRating' , 'DESC']],
        where : {
            numVotes : {
                [Op.gte] : 1000
            }
        }
    }).then(
        titles => {
            res.status(STATUS_CODE.OK).render('home/index',{
                title : titles,
                user : req.session.user || null
            }) ;
        }
    ).catch(
        err => {
            next(err) ;    
        }
    ) ;

}