const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vinyl = require('../models/vinyls');
const checkAuth = require('../middleware/check-auth');
router.use(express.static('public'));
const User = require('../models/users');


// find vinyl by id
router.get("/:vinylsId",(req,res,next)=>{
    const id = req.params.vinylsId;
    Vinyl.findById(id)
    .exec()
    .then(doc =>{
        
        if (doc){
            res.status(200).json(doc);  
        }else{
            res.status(404).json({
                message: 'No entry found'
            })
        }
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error:err});
    })
});
// post a vinyl
router.post('/post',(req,res,next)=>{
    const vinyl = new Vinyl({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        musicGenre: req.body.musicGenre,
        artist: req.body.artist
    })
    res.status(201).json({
        message: "Vinyl is posted",
        vinyl: vinyl 
    })
    vinyl.save()
})

// route for delete a vinyl from users list
router.delete('/:vinylId',checkAuth, (req, res, next) => {
    req.session.user = req.user;
    const user = req.session.user;
    User.findById(user._id)
      .exec()
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
        const vinylIndex = user.vinyls.indexOf(req.params.vinylId);
        if (vinylIndex === -1) {
          return res.status(404).send({ message: 'Vinyl not found in user collection' });
        }
        user.vinyls.splice(vinylIndex, 1);
        user.save();
        res.status(200).send({ message: 'Vinyl removed from user collection' });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
  


module.exports = router; 