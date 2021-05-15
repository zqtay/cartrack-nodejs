var express = require('express');
var bodyParser = require('body-parser');
var cors = require("cors");
var dotenv = require('dotenv');
var fs = require('fs');
var reqLimit = require('./services/request-limit');

//Use env var
dotenv.config();
const PORT = process.env.PORT || 3000;

//Express app setup
var app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.listen(PORT, () => {
    console.log(`${new Date().toISOString()}: Server is running on port ${process.env.PORT}`);
	app.emit("ready");
});

//Landing page
app.get('/', (req, res, next) => {
	res.render('index',{template:'templates/random'});
});

//Check for request limit
app.use('/api/*',(req, res, next) => {
	reqLimit.check(req, (err, data)=>{
		if(data.result === true) {
			res.locals.reqLimit = data;
			next();
		}
		else res.status(403).send({error: '403 Forbidden', reqLimit: data});
	});
});

app.get('/api/random', (req, res, next) => {
	//This is to simulate time elapsed to get data from database/file storage
	setTimeout(()=>{
		var data = {};
		data.random = ('0000'+Math.floor(Math.random() * 10000)).slice(-4);
		res.send({data:data, reqLimit:res.locals.reqLimit});
	},500); 
});

app.get('/logs', (req, res, next) => {
	fs.readFile('./logs/output.log', 'utf8', (err, data)=>{
		if(err) console.log(`${new Date().toISOString()}: ERROR ${err}`);
		if(data) res.send(data);
	});
});

app.get('*', (req, res) => {
  res.sendStatus(404);
});

//For testing
module.exports = app; 