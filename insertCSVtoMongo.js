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
      console.error('Cannot open "' + args[CSV_ARG] + '" for reading.');
      process.exit(1);
    }
  });
};


/*
Given a path to a valid CSV file, returns an array of objects converted from the CSV rows
 */
var getJSONFromCSV = function(csvPath) {
  // Convert CSV to JSON array using csvtojson
  var csvFileStream = fs.createReadStream(csvPath);

  var convertParams = {
    'constructResult': false,   // As CSV can be large, don't put it all in memory
    'ignoreEmpty':     true     // Ignore empty columns, as we don't need them in Mongo
  };

  var csvConverter = new CSVtoJSONConverter(convertParams);

  var jsonOutput = {};
  // Once stream is finished parsing, store the JSON
  csvConverter.on('end_parsed', function(jsonObject) {
    jsonOutput = jsonObject;
  });

  // Pipe file stream to the converter
  csvFileStream.pipe(csvConverter);

  return jsonOutput;
};


/*
Given a BulkWriteResult object, prints out useful information to user about what was written to DB
 */
var printResults = function(result) {
  console.log('Number of objects inserted: ' + result.nInserted);
  console.log('Number of errors: ' + result.writeErrors.length);

  // If errors occurred, output the messages as errors
  result.writeErrors.forEach(function(error, index) {
    console.error('Error ' + index + ': ' + error.errmsg);
  });
};



/*
 * * * * * * * * * * * * * * * * *
 * * * START OF MAIN SCRIPT  * * *
 * * * * * * * * * * * * * * * * *
 */


// Validate CLI args
checkArgs(process.argv);


// Connect and get reference to DB
MongoClient.connect(MONGO_URL, function(error, db) {
  if (!error) {
    console.log('Connected to database!');
  } else {
    console.error('Cannot connect to DB: ' + error.message);
    process.exit(1);
  }

  // Create new collection
  db.createCollection('train', function(error, collection) {
    if (error) {
      console.error('Cannot create new collection: ' + error.message);
    }
  });

  // Initialise unsorted collection for bulk insert operations
  var bulk = db.train.initializeUnorderedBulkOp();


  // Process the JSON array into Mongo insert statements
  getJSONFromCSV(process.argv[CSV_ARG]).forEach(function(object, index){
    bulk.insert(object);
  });


  // Execute all the "bulked" insert operations
  var result = bulk.execute();


  // Output results of the bulk write to user
  printResults(result);
});


