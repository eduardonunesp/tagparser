'use strict';

const assert = require('assert'),
  tagparser = require('../lib'),
  path = require('path');

let head = (arr) => arr[0]
let last = (arr) => arr[arr.length -1];
let contains = (arr, x) => arr.indexOf(x) > -1;

describe('Tag Parser', function() {
  it('should fulfill the promise file exists', function(done) {
    tagparser.fileExists(path.join(__dirname, 'tags.txt'))
      .then((fileTested) => {
        assert.equal(!!fileTested, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should reject the promise if file not exists', function(done) {
    tagparser.fileExists(path.join(__dirname, 'this_file_not_exists.txt'))
      .then((fileTested) => {
        done(new Error('File exists'));
      })
      .catch((err) => {
        done();
      });
  });

  it('should fulfill the promise list directory', function(done) {
    tagparser.listDirectory(path.join(__dirname, 'data'), 'json')
      .then((directory) => {
        directory = directory.sort();
        assert.equal(directory.length, 2)
        assert.equal(directory[0], 'file1.json')
        assert.equal(directory[1], 'file2.json')
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should reject the promise list directory', function(done) {
    tagparser.listDirectory(path.join(__dirname, 'dir_not_exists'), 'json')
      .then((directory) => {
        done(new Error('Directory exists'));
      })
      .catch((err) => {
        done();
      });
  });

  it('should fulfill the promise get content of a file', function(done) {
    tagparser.fileGetContents(path.join(__dirname, 'data', 'file1.json'))
      .then((file) => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should reject the promise get a content of a file', function(done) {
    tagparser.fileGetContents(path.join(__dirname, 'data', 'f.json'))
      .then((directory) => {
        done(new Error('Directory exists'));
      })
      .catch((err) => {
        done();
      });
  });

  it('should fulfill the promise get array from a file', function(done) {
    tagparser.getArrayOfTagsFromFile(path.join(__dirname, 'tags.txt'))
      .then((arrayFromFile) => {
        arrayFromFile = arrayFromFile.sort();
        assert.equal(arrayFromFile.length, 3)
        assert.equal(arrayFromFile[0], 'tag1')
        assert.equal(arrayFromFile[1], 'tag2')
        assert.equal(arrayFromFile[2], 'tag3')
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should reject the promise get array from a file', function(done) {
    tagparser.getArrayOfTagsFromFile(path.join(__dirname, 'not.txt'))
      .then((directory) => {
        done(new Error('Directory exists'));
      })
      .catch((err) => {
        done();
      });
  });

  it('should transverse entire JS object', function() {
    const mockedObject = [{
      name: 'First object',
      tags : ['color'],
      children : [{
        'tags' : ['animal', 'car']
      }]
    }, {
      name: 'Second object',
      tags: ['cat'],
      children: [{
        children: [{
          children: [{
            tags: ['mole']
          }]
        }]
      }]
    }, {
      name: 'Third object',
      tags: 'argonaut'
    }];


    let arr = tagparser.getTagsValuesFromObject(mockedObject).sort();
    assert.equal(arr.length, 6);
    assert.equal(head(arr), 'animal');
    assert.equal(last(arr), 'mole');
    assert.notEqual(last(arr), 'argonaut');
    assert.equal()
  });

  it('should parse json file from directory', function(done) {
    tagparser.parseJSONFromDir(path.join(__dirname, 'data'))
      .then((object) => {
        let firstObject = head(object);
        assert.equal(head(firstObject.tags), 'tag1');
        assert.equal(last(firstObject.tags), 'tag3');
        assert.equal(firstObject.tags.length, 3);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should sort properties from an object', function() {
    const mockedObject = {
      foo: 10,
      bar: 200,
      bibier: 0,
      tom: 1,
      mom: 100
    };

    const sorted = tagparser.sortProperties(mockedObject);
    assert.equal(contains(head(sorted), 'bar'), true);
    assert.equal(contains(last(sorted), 'bibier'), true);
  });

  it('should analyzes an array', function(done) {
    const mockedObject = ['tag1', 'tag1', 'tag4', 'tag5', 'tag2'];

    tagparser.arrayAnalysis(mockedObject, path.join(__dirname, 'tags.txt'))
      .then((result) => {
        assert.equal(head(result)[0], 'tag1');
        assert.equal(head(result)[1], 2);
        assert.equal(last(result)[0], 'tag3');
        assert.equal(last(result)[1], 0);
        done();
      })
      .catch((err) => done(err));
  });
});