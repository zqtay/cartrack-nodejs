//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();


chai.use(chaiHttp);
//Our parent block
describe('App test', () => {
/*
  * Test the /GET route
  */
  describe('/GET /', () => {
      it('it should GET landing page', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.headers['content-type'].to.have.string('text/html');
              done();
            });
      });
  });
  
  describe('/GET /api/random', () => {
      it('it should GET all the books', (done) => {
        chai.request(app)
            .get('/api/random')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.headers['content-type'].to.have.string('text/html');
              done();
            });
      });
  });

});