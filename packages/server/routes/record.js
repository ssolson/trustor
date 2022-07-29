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
recordRoutes.route("/record").get(function (req, res) {
 let db_connect = dbo.getDb("employees");
 db_connect
   .collection("records")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you get a single record by id
recordRoutes.route("/record/:id").get((req, res) => {
  //  console.log("req", req)
  let db_connect = dbo.getDb();
  let myquery = { _id: req.params.id };
  db_connect
    .collection("records")
    .findOne(myquery,  (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  //  console.log("res", res)
  
});
 
// Create a new record.
recordRoutes.route("/record/add").post(function (req, response) {
  let db_connect = dbo.getDb();
  // console.log("req.body", req.body)
  // Trust Data
  const trust_address = req.body.trust.trust_address;
  let trust_data = {  
    name: req.body.trust.name,   
    grantor_address: req.body.trust.grantor_address,
    trustee_address: req.body.trust.trustee_address,
    beneficiary_address: req.body.trust.beneficiary_address, 
    beneficiary_shares: req.body.trust.beneficiary_shares
  };


  let wallet_data = {
    _id: req.body._id, 
    [trust_address]: {
      data: trust_data,
      roles: [req.body.role]
    }
  };

  db_connect.collection("records").insertOne(
    {
      _id : req.body._id,
      [trust_address]:{
        data: trust_data,
        // roles: [] 
      },
      // [trust_address] : { $exists : true } 
    },
    {
      $setOnInsert: {_id : req.body._id}
      // $set: wallet_data,
      // $set:  {[trust_address]:{ roles: [req.body.role] }}
      

      // $addToSet: {
      //   [trust_address]: {
      //     data: trust_data,
      //     roles: [req.body.role]
      //   }        
      // },


      // $addToSet: {[trust_address]:{ roles: [req.body.role] }}
      // $push: {[trust_address]:{ roles: [req.body.role] }}
    },    
    {upsert :true}
  )

  // db_connect.collection("records").updateOne(    
  //   {
  //     _id : req.body._id,
  //     [trust_address]:{
  //       data: trust_data,
  //       // roles: [] 
  //     }
  //   },
  //   {
  //     $addToSet: {[trust_address]:{ roles: [req.body.role] }}
  //   },    
  //   // {upsert :true}
  // );



//  db_connect.collection("records").insertOne(
//   wallet_data, function (err, res) {
//     console.log("res", res)
//     if (err) throw err;
//     response.json(res);
//    }
//  );
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
  .collection("records")
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
 db_connect.collection("records").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});
 
module.exports = recordRoutes;