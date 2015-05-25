/*
Fixes the default types set by mongoimport.

- Explicitly casts all 'Track' values to Int32 type.
- Updates all 'LoadEmpty' values to their String equivalents.
*/


// Iteratively casts all 'Track' values to Int32 type
db.train.find({Track: {$exists: true}}).forEach(function(doc) {
  // Cast Track to be a Int32 type
  doc.Track = new NumberInt(doc.Track);

  // Write changes to DB
  db.train.save(doc);
});


// Update all 'LoadEmpty' values to String equivalents


// Create an ascending index on LoadEmpty field for faster queries
db.train.createIndex({LoadEmpty: 1});

// Change LoadEmpty = 1 to 'loaded'
db.train.update(
  // query
  { "LoadEmpty" : 1 },

  // update
  { $set: {LoadEmpty: 'loaded'} },

  // options
  {
    "multi" : true,   // update all documents
    "upsert" : false  // insert a new document, if no existing document match the query
  }
);

// Change LoadEmpty = 0 to 'empty'
db.train.update(
  // query
  { "LoadEmpty" : 0 },

  // update
  { $set: {LoadEmpty: 'empty'} },

  // options
  {
    "multi" : true,   // update all documents
    "upsert" : false  // insert a new document, if no existing document match the query
  }
);

// Change LoadEmpty = -1 to 'unknown'
db.train.update(
  // query
  { "LoadEmpty" : -1 },

  // update
  { $set: {LoadEmpty: 'unknown'} },

  // options
  {
    "multi" : true,   // update all documents
    "upsert" : false  // insert a new document, if no existing document match the query
  }
);

