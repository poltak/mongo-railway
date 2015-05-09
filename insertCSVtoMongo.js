/*
 * * * * * * * * * * * * * * * * *
 * * * SCRIPT INITIALISATION * * *
 * * * * * * * * * * * * * * * * *
 */

// Dependencies
CSVtoJSONConverter = require('csvtojson').core.Converter;
fs = require('fs');
MongoClient = require('mongodb').MongoClient;


// CLI arg constants
var NUM_ARGS = 3,
    CSV_ARG  = 2;


// Connection constants
var HOST    = '127.0.0.1',
    PORT    = '27017',
    DB_NAME = 'railway',
    MONGO_URL = 'mongodb://' + HOST + ':' + PORT + '/' + DB_NAME;


// Intermediate JSON path
var JSON_OUTPUT_PATH = '/Volumes/RAM Disk/csv_to_json_mongo.json';




/*
 * * * * * * * * * * * * * * * * * * *
 * * * START OF HELPER FUNCTIONS * * *
 * * * * * * * * * * * * * * * * * * *
 */

/*
Given CLI args, checks them for what is expected
 */
var checkArgs = function(args){
  // Check for expected number of args
  if (args.length != NUM_ARGS) {
    console.error('usage: node insertCSVToMongo.js [path/to/file.csv]');
    process.exit(1);
  }

  // Check for read access on the CSV path
  fs.access(args[CSV_ARG], fs.R_OK, function(error) {
    if (error) {
      console.error('Cannot access "' + args[CSV_ARG] + '" for reading: ' + error);
      process.exit(1);
    }
  });

  // Check for existing file on the JSON path
  fs.access(JSON_OUTPUT_PATH, fs.F_OK, function(error) {
    if (!error) {
      console.error(JSON_OUTPUT_PATH + ' already exists. Please choose another path.');
      process.exit(1);
    }
  });
};


/*
Given a path to a valid CSV file and a callback, converts CSV to JSON and inserts to DB using callback.

Callback is run after conversion is finished.
 */
var JSONFromCSV = function(csvPath, callback) {
  var convertParams = {
    'constructResult': false,   // Don't place JSON in memory, as input data can be large
    'ignoreEmpty':     true,    // Ignore empty columns, as we don't need them in Mongo
    'toArrayString':   true     // Make resulting objects put into an array
  };

  var csvConverter = new CSVtoJSONConverter(convertParams);

  var readStream = fs.createReadStream(csvPath);
  var writeStream = fs.createWriteStream(JSON_OUTPUT_PATH);

  // Pipe read stream to the converter, to the write stream
  readStream.pipe(csvConverter).pipe(writeStream);

  writeStream.on('finish', callback);
};


/*
Deals with connecting to database and performing writes of converted JSON
 */
var performDBWrite = function() {
  MongoClient.connect(MONGO_URL, function(error, db) {
    if (error) {
      console.error('Cannot connect to DB: ' + error.message);
      process.exit(1);
    }

    console.error('Connected to database!');

    var trainsCollection = db.collection('train');

    fs.readFile(JSON_OUTPUT_PATH, 'utf8', function(error, data) {
      if (error)  console.error('Could not open file for reading: ' + JSON_OUTPUT_PATH);

      var objects = JSON.parse(data);
      console.log('Number of objects to attempt to insert: ' + objects.length);

      // Queue up insertions for batch operation
      var batch = trainsCollection.initializeUnorderedBulkOp({useLegacyOps: true});

      objects.forEach(function(object, index) {
        batch.insert(object);
      });

      // Execute set-up batch operation
      batch.execute(function(error, result) {
        if (error)  console.error(error);

        console.error('Number of objects inserted: ' + result.nInserted);
        db.close();
      });

      // Remove intermediate JSON file
      fs.unlink(JSON_OUTPUT_PATH, function(error) {
        if (error)  console.error('Cannot remove temporary JSON output. Stored at: ' + JSON_OUTPUT_PATH);
      });
    });
  });
};



/*
 * * * * * * * * * * * * * * * * *
 * * * START OF MAIN SCRIPT  * * *
 * * * * * * * * * * * * * * * * *
 */


// Validate CLI args
checkArgs(process.argv);

// Perform the CSV to JSON conversion
JSONFromCSV(process.argv[CSV_ARG], performDBWrite);
