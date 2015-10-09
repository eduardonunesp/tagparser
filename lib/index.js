'use strict';

const fs = require('fs'),
  mpath = require('path');

/**
 * Check if file exists
 *
 * @param  {String} path Path to the file
 * @return {Object}      Promise resolve filepath, or reject with error
 */
function fileExists(path) {
  return new Promise(function(resolve, reject) {
    fs.stat(path, (err) => err ? reject(err) : resolve(path));
  });
};

/**
 * List the contents from a directory and return an array of filenames
 *
 * @param  {String} path          Directory path
 * @param  {String} filterOnlyExt Type of file to return, based on extension
 * @return {Object}               Promise resolve array with filenames or reject with error
 */
function listDirectory(path, filterOnlyExt) {
  return new Promise(function(resolve, reject) {
    fs.readdir(path, function(err, data) {
      if (err) {
        return reject(err);
      }

      if (!filterOnlyExt) {
        resolve(data);
      } else {

        // Make sure to filter specific extension if needed
        const filteredData = data.filter(function(file) {
          return file.split('.').pop() == filterOnlyExt;
        });
        resolve(filteredData);
      }
    });
  });
};

/**
 * Get the contents of a file in utf8 string
 *
 * @param  {String} path Path to the file
 * @return {Object}      Promise resolve file contents in utf8 String or reject with error
 */
function fileGetContents(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, (err, data) => err ? reject(err) : resolve(data.toString('utf8')));
  });
};

/**
 * Turn a list of characters separated by CRLF or \n into an array
 *
 * @param  {String} fileContents String with the contents
 * @return {Array}               Array of characteres
 */
const textListToJSArray = (fileContents) => fileContents.trim().split('\n');

/**
 * Get an array of tags from a file by the given path
 *
 * @param  {String} path Path to the file
 * @return {Object}      Promise resolve array of tags or reject with error
 */
function getArrayOfTagsFromFile(path) {
  return fileExists(path)
    .then(fileGetContents)
    .then(textListToJSArray);
};

/**
 * Transverse an entire object as a generator
 *
 * @param {Object} obj  Object to transverse
 * @yield {Generator}   Generator with specific tags element
 */
function *transverseObject(obj) {
  if (!obj) { return; }

  for (let i = 0; i< obj.length; i++){
    const val = obj[i];

    // Yield the tag there's no children object
    if (val.tags) {
      yield val.tags;
    }

    // Have children objects, need to good deep
    if (val.children) {
      yield *transverseObject(val.children);
    }
  }
}

/**
 * Verify if given JSON is valid
 *
 * @param {String} jsonFile JSON to be sanitized
 * @return {String} Return the JSON or empty String
 */
function JSONSanitizer(jsonFile) {
  try {
    JSON.parse(jsonFile);
    return jsonFile;
  } catch (e) {
    return "";
  }
}

/**
 * Parse JSON files from a specific directory
 *
 * @param  {String} path Path to parse json files
 * @return {Object}      Promise resolve is an object of all JSON files
 *                       found or reject with error
 */
function parseJSONFromDir(path) {
  return listDirectory(path, 'json')
    .then(function(files) {
      const promises = [];

      // Prepare to get contents and check each file
      files.forEach(function(file) {
        const readJSONPromise = fileExists(mpath.join(path, file))
          .then(function(fileConfirmed) {

            // Get the file
            return fileGetContents(fileConfirmed)

              // Check if a valid json from file, sanitize and clean
              .then((fileContent) => JSONSanitizer(fileContent))
              .then(function(jsonSanitized) {
                if (!jsonSanitized) {
                  console.error('Invalid json file', fileConfirmed);
                  return "{}"
                } else {
                  return jsonSanitized;
                }
              })
          });

        return promises.push(readJSONPromise);
      });

      return promises;
    })
    .then((files) => Promise.all(files))
    .then(function(jsons) {
      // Small trick to bind JSONs in an unique object
      const json = '[' + jsons.join(',') + ']';
      return JSON.parse(json);
    });
};

/**
 * Transverse an object and get all tags values in one array
 *
 * @param  {Object} object Object to transverse
 * @return {Array}         Array with all tags found
 */
function getTagsValuesFromObject(object) {
  const gen = transverseObject(object);
  let arr = [];
  let res = gen.next();

  // Transverse with a generator
  while(!res.done) {
    arr = arr.concat(res.value);
    res = gen.next();
  }

  return arr;
};

/**
 * Sort properties of an particular object
 *
 * @param  {Object} obj Object to sort
 * @return {Array}      Array of sorted properties and keys
 */
function sortProperties(obj) {
    const sortable = [];
    for(let key in obj) {
      if(obj.hasOwnProperty(key)) {
        sortable.push([key, obj[key]]);
      }
    }

    return sortable
      .sort((a, b) => a[1] - b[1])
      .reverse()
};

/**
 * Analyzes an array looking for specific tags and counting the valid occurrences
 *
 * @param  {Array} array Array to analyse
 * @return {Object}       Promise with all ocurrences calculated and sorted or reject with error
 */
function arrayAnalysis(array, tagsFile) {
  return fileExists(tagsFile)
    .then((fileConfirmed) => fs.readFileSync(fileConfirmed).toString('utf8'))
    .then(textListToJSArray)
    .then((tags) => {
      let occurrences = {};
      let validOcurrences = {};

      // Count the ocurrences
      for (let i = 0; i < array.length; i++) {
        const num = array[i];
        occurrences[num] = occurrences[num] ? occurrences[num]+1 : 1;
      }

      // Which tags we want to compare if exists
      tags.forEach((tag) => {
        validOcurrences[tag] = occurrences[tag] ? occurrences[tag] : 0
      });

      // Sort and return
      const sortedProperties = sortProperties(validOcurrences);
      return sortedProperties;
    });
};

/**
 * Format the output to present to the data
 *
 * @param  {Array} array Array already analyzed and ready to print
 */
function formatOutput(array, separator) {
  const output = [];
  for (let i = 0; i < array.length; i++) {
    output.push(array[i][0] + ' ' + array[i][1]);
  }

  return separator ? output.join(separator) : output.join('\n')
};

module.exports = {}
module.exports.formatOutput = formatOutput;
module.exports.arrayAnalysis = arrayAnalysis;
module.exports.sortProperties = sortProperties;
module.exports.getTagsValuesFromObject = getTagsValuesFromObject;
module.exports.parseJSONFromDir = parseJSONFromDir;
module.exports.JSONSanitizer = JSONSanitizer;
module.exports.transverseObject = transverseObject;
module.exports.getArrayOfTagsFromFile = getArrayOfTagsFromFile
module.exports.textListToJSArray = textListToJSArray
module.exports.fileGetContents = fileGetContents
module.exports.listDirectory = listDirectory
module.exports.fileExists = fileExists