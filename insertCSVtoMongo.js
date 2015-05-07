// Dependencies
CSVtoJSONConverter = require('csvtojson').core.Converter;
fs = require('fs');

// CLI arg constants
var NUM_ARGS = 3,
    CSV_ARG  = 2;

// Connection constants
var HOST    = '127.0.0.1',
    PORT    = '8000',
    DB_NAME = 'railway';


// Validate CLI args
checkArgs(process.argv);


// Connect and get reference to DB
conn = new Mongo(HOST + ':' + POST);
db = conn.getDB(DB_NAME);


// Initialise unsorted collection for bulk insert operations
var bulk = db.collection.initializeUnorderedBulkOp()


// Process the JSON array into Mongo insert statements



// Execute all the "bulked" insert operations
bulk.execute()



/*
Given CLI args, checks them for what is expected
 */
var checkArgs = function(args){
  // Check for expected number of args
  if (args.length() != NUM_ARGS) {
    console.error('usage: node insertCSVToMongo.js [path/to/file.csv]');
    process.exit(1);
  }

  // Check for read access on the CSV path
  fs.access(args[CSV_ARG], fs.R_OK, function(error) {
    console.error('Cannot open "' + args[CSV_ARG] + '" for reading.');
    process.exit(1);
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
}