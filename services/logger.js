var fs = require('fs');
const logFolder = '../logs/';


var logStream = fs.createWriteStream('log', {flags: 'a'});
// use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
logStream.write('Initial line...');
logStream.end('this is the end line');


fs.readdir(logFolder, (err, files) => {
	//Expected log filename: log0 (without extension)
	var logList = files.filter(f => f.startswWith('log') && /^\d+$/.test(f.slice(3)));
	maxLogIndex = Number.max(logList.map(f => Number(f.slice(3))));
	
});

function a(){
	
}


fs.closeSync(fs.openSync('../logs/log.txt', 'w'));


var m = {
	init:
	write: logStream.write,
	end: logStream.end
}

module.exports = m;