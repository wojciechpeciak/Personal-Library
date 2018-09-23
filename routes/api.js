/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
          if(err) return console.log('Database error: '+err);
      db.collection('books')
        .aggregate([
          {$match: {}}, 
          {$project: { _id: true, title: true, commentcount: { $size: "$comments"}}}])
        .toArray( (err, dbRes) => {
          if(err) return console.log('Database read err: '+err);
          res.json(dbRes);
        });
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    if(!title || title == '')
      return res.send('invalid title');
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        if(err) return console.log('Database error: '+err);
    db.collection('books')
      .insertOne({
        title: title,
        comments: []
        }, function (err, dbRes) {
          if(err) return console.log('Database insert err: '+err);
          res.json(dbRes.ops[0]);
        });
    
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
          if(err) return console.log('Database error: '+err);
      db.collection('books')
        .remove({}, (err, dbRes) => {
          if(err) return console.log('Database remove err: '+err);
          res.send('complete delete successful');
          console.log('complete delete of '+dbRes.result.n+' elem');
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
          if(err) return console.log('Database error: '+err);
      db.collection('books')
        .findOne({_id: ObjectId(bookid)}, (err, dbRes) => {
          if(err) return console.log('Database read err: '+err);
          dbRes == null ? res.send('no book exists') : res.json(dbRes);
        });
      
    });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      try{
        bookid = ObjectId(bookid);
      } catch(err){
        return res.send('invalid _id');
      }
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
            if(err) return console.log('Database error: '+err);
        db.collection('books')
          .findOneAndUpdate({
            _id: bookid
          },{
            $push: { comments: comment }
          }, (err, dbRes) => {
            if(err) return console.log('Database updete err: '+err);
            res.json(dbRes.value);
        });

      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      try{
        bookid = ObjectId(bookid);
      } catch(err){
        return res.send('invalid _id');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
              if(err) return console.log('Database error: '+err);
          db.collection('books')
            .findOneAndDelete({
              _id: bookid
            }, (err, dbRes) => {
              if(err) return console.log('Database delete err: '+err);
              res.send('delete successful');
          });

      });
    
    });
  
};
