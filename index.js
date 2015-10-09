'use strict';

const tagparser = require('./lib'),
  mpath = require('path'),
  http = require('http');

let NODE_ENV = process.env.NODE_ENV || 'development';
let PORT = process.env.PORT || 9000;

process.chdir(__dirname);

let httpServer = false;

process.argv.forEach(function (val, index, array) {
  if (val == '--http') {
    httpServer = true;
  }
});

if (httpServer || NODE_ENV === 'production') {
  http.createServer(function(req, res) {
    // Read JSON files, tags file and calculate
    tagparser.parseJSONFromDir(mpath.join(__dirname, 'data'))
      .then(tagparser.getTagsValuesFromObject)
      .then((values) => {
        return tagparser.arrayAnalysis(values, mpath.join(__dirname, 'tags.txt'));
      })
      .then((result) => tagparser.formatOutput(result, '<br/>'))
      .then((output) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(output);
        res.end();
      })
      .catch((err) => {
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.write(err.toString());
        res.end();
      });

  }).listen(PORT);

  return
}

console.log('Console only output');

// Read JSON files, tags file and calculate
tagparser.parseJSONFromDir(mpath.join(__dirname, 'data'))
  .then(tagparser.getTagsValuesFromObject)
  .then((values) => {
    return tagparser.arrayAnalysis(values, mpath.join(__dirname, 'tags.txt'))
  })
  .then((result) => tagparser.formatOutput(result, '\n'))
  .then((output) => console.log(output))
  .catch((err) => console.log(err))