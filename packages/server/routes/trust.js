const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the records.
recordRoutes.route("/trust").get(function (req, res) {
 let db_connect = dbo.getDb();
 db_connect
   .collection("trusts")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you get a single record by id
recordRoutes.route("/trust/:id").get((req, res) => {
  //  console.log("req", req)
  let db_connect = dbo.getDb();
  let myquery = { _id: req.params.id };
  db_connect
    .collection("trusts")
    .findOne(myquery,  (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  //  console.log("res", res)
});
 
// Add a new trust to the database
recordRoutes.route("/trust/add").post(function (req, response) {
  let db_connect = dbo.getDb();
  // console.log("req.body", req.body)

 db_connect.collection("trusts").insertOne(
  req.body, function (err, res) {
    console.log("res", res)
    if (err) throw err;
    response.json(res);
   }
 );
});

// Sync a trust blockchain with blockchain 
recordRoutes.route("/trust/sync/:id").post(function (req, response) {
  let db_connect = dbo.getDb(); 
  console.log("req.params", req.params)
  let myquery = { _id:  req.params.id };


  // db_connect
  // .collection("trusts")
  // .find(myquery)
  // .toArray(function (err, result) {
  //   if (err) throw err;
  //   // let res = result.json();
  //   console.log(result);
  // });


  // console.log("req.body", req.body)
  let newvalues = {   
    $set: {
      blockchain : req.body , 
    }
   }

   db_connect
   .collection("trusts")
   .updateOne(myquery, newvalues, function (err, res) {
     if (err) throw err;
     console.log("1 document updated");
     console.log("res", res);
     response.json(res);
   });
 });
 
// Update a record by id.
recordRoutes.route("/new-trust/:id").post(function (req, response) {
 let db_connect = dbo.getDb(); 
 
 const trust_address = req.body.trust.trust_address;
 let trust_data = {  
   name: req.body.trust.name,   
   grantor_address: req.body.trust.grantor_address,
   trustee_address: req.body.trust.trustee_address,
   beneficiary_address: req.body.trust.beneficiary_address, 
   beneficiary_shares: req.body.trust.beneficiary_shares
 };
 console.log(trust_data)
 let myquery = { _id:  req.params.id }; 
 console.log("myquery",myquery)

 let newvalues = {   
   $set: {     
    [trust_address]: {
      data: trust_data,
      roles: [req.body.role]
    },
   }, 
  }
  db_connect
  .collection("trusts")
  .updateOne(myquery, newvalues, function (err, res) {
    if (err) throw err;
    console.log("1 document updated");
    console.log("res", res);
    response.json(res);
  });
});
 
// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
//  console.log("req.params.id", req.params.id);
 let myquery = { _id: req.params.id };
 db_connect.collection("trusts").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});
 
module.exports = recordRoutes;