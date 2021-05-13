var express = require('express');
var bodyParser = require('body-parser');
var cors = require("cors");
var dotenv = require('dotenv');
var reqLimit = require('./services/request-limit');
//var logger = require('./services/logger');

//Use env var
dotenv.config();
//console.log(process.env);
const PORT = process.env.PORT || 3000;

//Express app setup
var app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

//Landing page
app.get('/', (req,res,next) => {
	res.render('index',{template:'templates/random'});
});

//Check for request limit
app.use('/api/random',(req, res, next) => {
	reqLimit.check(req, (err, data)=>{
		if(data.result === true) {
			res.locals.reqLimit = data;
			next();
		}
		else res.status(403).send({error: '403 Forbidden', reqLimit: data});
	});
});

app.get('/api/random', (req,res,next) => {
	setTimeout(()=>{
		var data = {};
		data.data = ('0000'+Math.floor(Math.random() * 10000)).slice(-4);
		res.send({data:data, reqLimit:res.locals.reqLimit});
	},50); //This is to simulate time elapsed to get data from database/file storage
});

app.get('*', (req, res) => {
  res.sendStatus(404);
});