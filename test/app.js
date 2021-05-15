var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

before(done => {
	setTimeout(done, 5000);
	// server.on("ready", () => {
		// done();
	// })
})

describe('App test', () => {
	//Wait for server to be up

	describe('GET /', () => {
		it('it should GET landing page', (done) => {
			chai.request(server)
            .get('/')
            .end((err, res) => {
				console.log(res);
				res.should.have.status(200);
				res.headers['content-type'].to.have.string('text/html');
				done();
			});
		});
	});
	
	describe('GET /api/random', () => {
		it('it should GET data and reqLimit', (done) => {
			chai.request(server)
            .get('/api/random')
            .end((err, res) => {
				res.should.have.status(200);
				res.headers['content-type'].to.have.string('application/json');
				console.log(res);
				done();
			});
		});
	});
	
	afterEach(function(){
		server.close();
	})
	
});