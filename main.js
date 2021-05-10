const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); //Use env var

const app = express();
app.use(bodyParser.json());

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.get('/', (req,res,next) => {
	var ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;
	res.send(ip);
});