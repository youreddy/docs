/**
 * Module dependencies.
 */

var http = require('http');
var request = require('supertest');
var docsapp = require('../app');


describe('Application', function() {

  describe('GET /test', function(){
    it('respond OK with json', function(done){
      request(docsapp._app)
        .get('/test')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })
  })
});
