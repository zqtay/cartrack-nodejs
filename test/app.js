var server = require("../app");
var chai = require("chai");
var chaiHttp = require("chai-http");
var dotenv = require('dotenv');

dotenv.config();
const REQUEST_LIMIT_NORMAL_COUNT = process.env.REQUEST_LIMIT_NORMAL_COUNT

// Assertion 
chai.should();
chai.use(chaiHttp); 

describe('App test', () => {

    describe("GET /", () => {
        it("It should GET landing page", async () => {
            var res = await chai.request(server).get("/")
			res.should.have.status(200);
			res.headers['content-type'].should.have.string('text/html');
        });
	});
	
	describe("GET /api/random", () => {
        it("It should GET data", (done) => {
            chai.request(server)
                .get("/api/random")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });
        });
    });
	
	//Request limit
	describe("GET /api/random", () => {
        it("It should error 403", async () => {
			for (var i = 0; i < REQUEST_LIMIT_NORMAL_COUNT; i++){
				await chai.request(server).get("/api/random");
			}
            var res = await chai.request(server).get("/api/random")
			res.should.have.status(403);
        });
    });
	
	//Non-existing route
	describe("GET /routenotexist", () => {
        it("It should error 404", (done) => {
            chai.request(server)
                .get("/routenotexist")
                .end((err, response) => {
                    response.should.have.status(404);
                done();
                });
        });
    });

});