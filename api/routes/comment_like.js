const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users');
const Vinyl = require('../models/vinyls');
const Comment = require('../models/comment');
const Like = require('../models/like');
const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    const user = req.session.user;
     // ID of the logged-in user
    
    User.find()
      .populate('vinyls', 'name') // Include the 'vinyls' array and select only the 'name' field
      .exec()
      .then(users => {
        const promises = [];
  
        users.forEach(user => {
          const userObj = user.toObject(); // Convert Mongoose object to plain object
  
          // Find all comments related to the user
          const commentPromise = Comment.find({ user: user._id })
            .populate('author', 'username')
            .exec()
            .then(comments => {
              userObj.comments = comments;
            });
  
          // Find all likes related to the user, and check if the logged-in user has liked the user
          const likePromise = Like.find({ user: user._id })
            .exec()
            .then(likes => {
              userObj.likes = likes;
  
              if (user._id) {
                return Like.exists({ user: user._id, author: user._id })
                  .then(hasLiked => {
                    userObj.hasLiked = hasLiked;
                  });
              } else {
                userObj.hasLiked = false;
              }
            });
  
          promises.push(commentPromise, likePromise);
  
          // Add the modified user object to the array of users
          users[users.indexOf(user)] = userObj;
        });
  
        // Wait for all promises to complete and send the response
        Promise.all(promises)
          .then(() => {
            res.status(200).json(users);
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  });
  


module.exports = router; 