/*
Examples of MongoDB updates to remove bad data from database.
 */

// Find all documents stating a value less than 0 for KM travelled (these are obviously wrong)
// Unset the km value, which essentially removes the key-value pair from the document, while retaining all other pairs.
db.train.update(
  { km: {$lt: 0} },
  { $unset: {km: 1} },
  { multi: true }
);

// Unset all bad speed values
db.train.update(
  { speed: {$lt: 0} },
  { $unset: {speed: 1} },
  { multi: true }
);

// Unset all bad LoadEmpty values
db.train.update(
  { LoadEmpty: {$not: {$in: ['unknown', 'empty', 'loaded']} } },
  { $unset: {LoadEmpty: 1} },
  { multi: true }
);

// Unset all bad Track values
db.train.update(
  { $or: [ {Track: {$lt: 0}}, {Track: {$gt: 213841}} ] },
  { $unset: {Track: 1} },
  { multi: true }
);