const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const url = require('url'); 
const Vinyl = require('../models/vinyls');
const checkAuth = require('../middleware/check-auth');
router.use(express.static('public'));
router.get('/guest',checkAuth,(req,res,next)=>{
    
    const pass = url.parse(req.url,true).query;          
    let query = {};                                 //pass variable has the url of the query with var query we set an empty var 
    if (pass.musicGenre){                                 // so we can fill it only with the filters the user added
        query.musicGenre = pass.musicGenre;
    }
    if (pass.artist){                                 // so we can fill it only with the filters the user added
        query.artist = pass.artist;
    }
    
     Vinyl.find(query)                                           
        .exec()
        .then(docs =>{
            const response ={
                vinyls: docs.map(doc =>{
                    return{
                        title: doc.title,
                        musicGenre: doc.musicGenre,
                        _id: doc._id,
                        artist: doc.artist,
                        comments: doc.comments
                        
                    }
                })
            }
            
            res.render('vinyl_guest', {vinyls: response.vinyls});
            
            
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error:err});
        })
    
});
router.get('/',checkAuth,(req,res,next)=>{
    
    const pass = url.parse(req.url,true).query;          
    let query = {};                                 //pass variable has the url of the query with var query we set an empty var 
    if (pass.musicGenre){                                 // so we can fill it only with the filters the user added
        query.musicGenre = pass.musicGenre;
    }
    if (pass.artist){                                 // so we can fill it only with the filters the user added
        query.artist = pass.artist;
    }
    
     Vinyl.find(query)                                           
        .exec()
        .then(docs =>{
            const response ={
                vinyls: docs.map(doc =>{
                    return{
                        title: doc.title,
                        musicGenre: doc.musicGenre,
                        _id: doc._id,
                        artist: doc.artist,
                        comments: doc.comments,
                        likes: doc.likes
                        
                    }
                })
            }
            
            res.render('vinyl_display', {vinyls: response.vinyls});
            
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error:err});
        })
    
});

module.exports = router;