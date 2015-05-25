# FIT Computer Science Honours Reading Unit
## Jonathan Poltak Samosir
### 2015-05-15


This document describes the contained files in this archive. Note that all operations are performed with the assumption
of the railway data being stored in the 'train' collection in the 'railway' database. Furthermore, all javascript
code can be executed directly in the native mongo shell.

All of the operations performed in source files in this archive is documented more thoroughly in the report for
assessment task 3.


## Importing of data into Mongo
Command to insert CSV with headers to Mongo in 'train' collection in 'railway' db:

mongoimport -d railway -c train --type csv --file test.csv --headerline --ignoreBlanks

This needs to be run for all CSV files you want to import to Mongo.


## fixtypes.js
mongoimport guesses the safest default data types for each value. Often this is not appropriate, so updates
of such values are performed in this file.


## restructure.js
mongoimport structures the data as "flat" documents, without any real structure, hence all appropriate restructuring of
values are performed in this file.


## baddata.js
Shows how noisy data was discovered and discarded from original dataset.


## mapreduce.js
Map reduce example to show querying and processing capabilities in Mongo.


## data_samples/original_dataset.csv
The original dataset containing 99,999 rows from IRT team.


## data_samples/test_faulty.csv
A sample faulty dataset, with missing values for certain rows.


## data_samples/test_addsensors.csv
A sample dataset with additional sensor values not present in original dataset.