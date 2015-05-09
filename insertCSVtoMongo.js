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
var NUM_ARGS = 4,
    CSV_ARG  = 2,
    JSON_ARG = 3;


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
    console.error('usage: node insertCSVToMongo.js [path/to/file.csv] [path/to/output_file.json]');
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
  fs.access(args[JSON_ARG], fs.F_OK, function(error) {
    if (!error) {
      console.error(args[JSON_ARG] + ' already exists. Please choose another path.');
      process.exit(1);
    }
  });
};


/*
Given a path to a valid CSV file, returns an array of objects converted from the CSV rows
 */
var getJSONFromCSV = function(csvPath, outputJsonPath) {
  var convertParams = {
    'constructResult': false,   // Don't place JSON in memory, as input data can be large
    'ignoreEmpty':     true     // Ignore empty columns, as we don't need them in Mongo
  };

  var csvConverter = new CSVtoJSONConverter(convertParams);

  var readStream = fs.createReadStream(csvPath);
  var writeStream = fs.createWriteStream(outputJsonPath);

  // Pipe read stream to the converter, to the write stream
  readStream.pipe(csvConverter).pipe(writeStream);
};


/*
Given a BulkWriteResult object, prints out useful information to user about what was written to DB
 */
var printResults = function(result) {
  console.log('Number of objects inserted: ' + result.nInserted);

  if (result.writeError) {
    console.log('Error was encountered: ' + result.writeError.errmsg);
  }
};



/*
 * * * * * * * * * * * * * * * * *
 * * * START OF MAIN SCRIPT  * * *
 * * * * * * * * * * * * * * * * *
 */


// Validate CLI args
checkArgs(process.argv);

// Perform the CSV to JSON conversion
getJSONFromCSV(process.argv[CSV_ARG], process.argv[JSON_ARG]);

// Give feedback on conversion
console.log('CSV successfully converted to JSON.');


// Connect and get reference to DB
MongoClient.connect(MONGO_URL, function(error, db) {
  if (error) {
    console.error('Cannot connect to DB: ' + error.message);
    process.exit(1);
  }

  console.log('Connected to database!');

  var trainsCollection = db.collection('train');
  var docs = getJSONFromCSV(process.argv[CSV_ARG]);
  console.log(docs);
});


