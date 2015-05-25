/*
Runs a basic map reduce to get the total distance travelled on each track.
Note that it excludes where km value is given as less than 0.
 */

// Select the Track and km fields from all documents
var mapFunc = function() {
  emit(this.Track, this.km);
};

// Reduces the km values from all mapped documents
var reduceFunc = function(keyTrack, kms) {
  return Array.sum(kms);
};

// Grabs the average of the reduced km values
var finalizeFunc = function(key, reducedVal) {
  reducedVal.avg = reducedVal.qty / reducedVal.count;

  return reducedVal;
};

// Execute the map reduce with the specified functions
db.train.mapReduce(
  mapFunc,
  reduceFunc,
  {
    out: 'total_distance',      // Stores output into new 'total_distance' collection
    query: { km: { $gt: 0 }},   // Excludes bad (< 0) km values
    finalize: finalizeFunc
  }
);

