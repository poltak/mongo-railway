// Connection constants
var HOST    = '127.0.0.1',
    PORT    = '8000',
    DB_NAME = 'railway';

// Connect and get reference to DB
conn = new Mongo(HOST + ':' + POST);
db = conn.getDB(DB_NAME);


// Initialise unsorted collection for bulk insert operations
var bulk = db.collection.initializeUnorderedBulkOp()


// Read from CSV and convert to JSON



// Execute all the "bulked" insert operations
bulk.execute()


// Converts a line from the CSV to appropriate JSON format, using provided CSV headers
var CSVtoJSON = function(csvHeader, csvLine) {
  var csvElements = csvLine.split(',').map(trim);

  var json = {};
  csvHeader.forEach(function(element, index){
    json.csvHeader[index] = element;
  });

  return json;
};