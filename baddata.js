// Find all documents stating a value less than 0 for KM travelled (these are obviously wrong)
db.train.find({km: {$lt: 0}});
