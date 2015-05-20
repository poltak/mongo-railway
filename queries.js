// Command to insert CSV with headers to Mongo:
//mongoimport -d railway -c train --type csv --file ~/Downloads/test.csv --headerline --ignoreBlanks

/*
Runs a basic map reduce to get the total distance travelled on each track
Note that it excludes where km value is given as less than 0.
 */
function totalDistanceMR() {
  var mapFunc = function() {
    emit(this.Track, this.km);
  };

  var reduceFunc = function(keyTrack, kms) {
    return Array.sum(kms);
  };

  var finalizeFunc = function(key, reducedVal) {
    reducedVal.avg = reducedVal.qty / reducedVal.count;

    return reducedVal;
  };

  db.train.mapReduce(
    mapFunc,
    reduceFunc,
    {
      out: 'total_distance',
      query: { km: { $gt: 0 }},
      finalize: finalizeFunc
    }
  );
}

function fixTypes() {
  db.train.find({Track: {$exists: true}}).forEach(function(doc) {
    // Cast Track to be a Int32 type
    doc.Track = new NumberInt(doc.Track);

    // Write changes to DB
    db.train.save(doc);
  });

  // Change LoadEmpty = 1 to 'loaded'
  db.train.update(
    // query
    { "LoadEmpty" : 1 },

    // update
    { $set: {LoadEmpty: 'loaded'} },

    // options
    {
      "multi" : true,  // update only one document
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
      "multi" : true,  // update only one document
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
      "multi" : true,  // update only one document
      "upsert" : false  // insert a new document, if no existing document match the query
    }
  );
}

/*
Iteratively restructure default documents into related fields
 */
function changeStructure() {
  var updateDocsFunc = function(doc) {
    // Add location nested doc
    doc.Loc = {
      Lat: doc.Lat,
      Lon: doc.Lon
    };

    // Add Bounce nested doc
    doc.Bounce = {
      Front: doc.BounceFront,
      Rear: doc.BounceRear
    };

    // Add Rock nested doc
    doc.Rock = {
      Front: doc.RockFront,
      Rear: doc.RockRear
    };

    // Add SND nested doc
    doc.SND = {
      SND1: doc.SND1,
      SND2: doc.SND2,
      SND3: doc.SND3,
      SND4: doc.SND4
    };

    // Add Acc nested doc
    doc.Acc = {
      Left: doc.AccLeft,
      Right: doc.AccRight
    };

    // Delete old values
    delete doc.Lat;
    delete doc.Lon;
    delete doc.BounceFront;
    delete doc.BounceRear;
    delete doc.RockFront;
    delete doc.RockRear;
    delete doc.SND1;
    delete doc.SND2;
    delete doc.SND3;
    delete doc.SND4;
    delete doc.AccLeft;
    delete doc.AccRight;

    // Write changes
    db.train.save(doc);
  };

  db.train.find().snapshot().forEach(updateDocsFunc);

  // Create a geospatial index on Loc nested document
  db.train.createIndex({Loc: '2d'});

  // Create an index on km field
  db.train.createIndex({km: 1});

  // Find all documents stating a value less than 0 for KM travelled (these are obviously wrong)
  db.train.find({km: {$lt: 0}});
}

