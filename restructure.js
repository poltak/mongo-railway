/*
Iteratively restructure default documents by grouping related fields into subdocuments.
 */

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

// Iteratively perform restructuring
db.train.find().forEach(updateDocsFunc);

// Create a geospatial index on Loc nested document
db.train.createIndex({Loc: '2d'});

// Create an ascending index on km field
db.train.createIndex({km: 1});
