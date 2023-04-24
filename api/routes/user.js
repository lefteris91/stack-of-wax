const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users');
const Vinyl = require('../models/vinyls');
const bcrypt = require('bcrypt');
const env = require('dotenv').config();
const checkAuth = require('../middleware/check-auth');
const bodyParser =require('body-parser');


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


// route for signup 
// diorthwsei ola ta routes prepei na metaferthoun se controllers
// views declaration

router.use(express.static('public'));
router.get('/logged_in', (req, res) => {
    res.render('logged_in');
  });
//
router.post('/signup',checkAuth, (req, res , next)=>{
  User.find({username:req.body.username})
  .exec()
  .then(user=>{
      if(user.length >= 1){
          return res.status(409).json({
              message:"User exists"
          });
      } else {
          bcrypt.hash(req.body.password, 10, (err,hash)=>{
              if(err){
                  return res.status(500).json({
                      error:err
                  })
              }else {
                  const user = new User({
                      _id: new mongoose.Types.ObjectId(),
                      username:req.body.username,
                      email:req.body.email,
                      password: hash
                  });
                  user.save()
                  .then(result =>{
                    delete req.session.user; // log out the user
                    res.redirect('/'); // redirect to the homepage
                  })
                  .catch(err =>{
                      console.log(err);
                      res.status(500).json({
                          error:err
                      })
                  })
                  
              }
          }) 
      }
  })
});

// adding a vinyl in user vinyls array
router.post('/:vinylId', checkAuth, (req, res, next) => {
  req.session.user = req.user;
  const user = req.session.user;
  
  Vinyl.findById(req.params.vinylId)
    .then((vinyl) => {
      console.log(vinyl);
      if (!vinyl) {
        return res.status(404).send({ message: 'Vinyl not found' });
      }
      const vinylExists = user.vinyls.some((v) => v._id.equals(vinyl._id));
      if (vinylExists) {
        const message = 'Vinyl already exists in user vinyls';
        return  message;
      }
      user.vinyls.push(vinyl);
      user.save();
      res.redirect('/user/vinylList');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Show users vinyl list
router.get('/vinylList', checkAuth, async (req, res, next) => {
  req.session.user = req.user;
  const user = req.session.user;

  const promises = user.vinyls.map((vinylId) =>
    Vinyl.findById(vinylId).exec()
  );
  
  try {
    const vinylsArray = await Promise.all(promises);

    if (vinylsArray.length === 0) {
      res.render('logged_in');
    } else {
      res.render('vinyl_list', { vinyls: vinylsArray });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

// comment route
  
router.post('/comment/:vinylId', checkAuth, (req, res, next) => {
  const user = req.session.user;
  const commentText = req.body.comment;

  // Find the user by their ID
  User.findById(user._id)
    .exec()
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
        return;
      }

      // Create a new comment object
      const newComment = {
        user: user._id,
        comment: commentText
      };

      // Find the vinyl by ID
      Vinyl.findById(req.params.vinylId)
        .exec()
        .then(vinyl => {
          if (!vinyl) {
            res.status(404).send('Vinyl not found');
            return;
          }

          // Add the new comment to the vinyl's comments array
          vinyl.comments.push(newComment);

          // Save the vinyl document
          vinyl.save(err => {
            if (err) {
              console.error(err);
              res.status(500).send('Server error');
            } else {
              res.send('Comment added successfully');
            }
          });
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Server error');
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});
// like route

router.post('/like/:vinylId', checkAuth, (req, res, next) => {
  const user = req.user;
  const vinylId = req.params.vinylId;

  User.findById(user._id)
    .exec()
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
      } else {
        // Find the vinyl by ID and update its likes array
        Vinyl.findByIdAndUpdate(
          vinylId,
          {
            $addToSet: {
              likes: user._id
            }
          },
          { new: true }
        )
          .exec()
          .then(vinyl => {
            if (!vinyl) {
              res.status(404).send('Vinyl not found');
            } else {
              
              res.redirect('/filters');
            }
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});









module.exports = router; 