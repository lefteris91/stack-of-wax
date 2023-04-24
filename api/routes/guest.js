const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vinyl = require('../models/vinyls');
const checkAuth = require('../middleware/check-auth');
router.use(express.static('public'));
const User = require('../models/users');

// display all vinyls
router.get('/',checkAuth, (req, res , next)=>{
    Vinyl.find()
    .select('title musicGenre artist')
    .exec()
    .then(docs =>{
        const response ={
            vinyls: docs.map(doc =>{
                return{
                    title: doc.title,
                    musicGenre: doc.musicGenre,
                    _id: doc._id,
                    artist: doc.artist,
                    image: doc.image
                    
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



module.exports = router; 