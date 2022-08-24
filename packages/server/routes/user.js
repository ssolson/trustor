const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// Get Users
recordRoutes.route("/user").get(function (req, res) {
 let db_connect = dbo.getDb();
 db_connect
   .collection("users")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// Search for user by ID
recordRoutes.route("/user/:id").get((req, res) => {
  //  console.log("req", req)
  let db_connect = dbo.getDb();
  let myquery = { _id: req.params.id };
  db_connect
    .collection("users")
    .findOne(myquery,  (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  //  console.log("res", res)
});

// Search for users with a given trust
recordRoutes.route("/user/trust/:id").get((req, res) => {
  //  console.log("req", req)
  let db_connect = dbo.getDb();
  let myquery = { [req.params.id] : { $exists : true } };
  db_connect
    .collection("users")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });;
  console.log("res", res)
});
 
// Create a new record.
recordRoutes.route("/user/add").post(function (req, response) {
  let db_connect = dbo.getDb();
  // console.log("req.body", req.body)

 db_connect.collection("users").insertOne(
  req.body, function (err, res) {
    console.log("res", res)
    if (err) throw err;
    response.json(res);
   }
 );
});
 
// Update a user by id.
recordRoutes.route("/user/:id").post(function (req, response) {
 let db_connect = dbo.getDb(); 
 console.log("req.params", req.params)
 let myquery = { _id:  req.params.id };
 console.log("req.body", req.body)
 let newvalues = {   
   $set: req.body , 
  }
  db_connect
  .collection("users")
  .updateOne(myquery, newvalues, function (err, res) {
    if (err) throw err;
    console.log("1 document updated");
    console.log("res", res);
    response.json(res);
  });
});
 
// Delete a user
recordRoutes.route("/user/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
//  console.log("req.params.id", req.params.id);
 let myquery = { _id: req.params.id };
 db_connect.collection("users").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });

//  // Delete a trust from a user
// recordRoutes.route("/user/:id").delete((req, response) => {
//   let db_connect = dbo.getDb();
//  //  console.log("req.params.id", req.params.id);
//   let myquery = { _id: req.params.id };
//   db_connect.collection("users").deleteOne(myquery, function (err, obj) {
//     if (err) throw err;
//     console.log("1 document deleted");
//     response.json(obj);
//   });

});
 
module.exports = recordRoutes;