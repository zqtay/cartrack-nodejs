const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/*	We are using sliding window technique
*	Time 		|-----|-----|-----|-----|
*	Marker		A     B   X C  Y  D Z   
*	Request		**  ** * * 
*	
* 	The window starts when the user first made a request, time marked as A.
*	The most recent request is made in B-C, thus the current window start time is B. Current window is B-C, last window is A-B.
*	Currently the reqUser entry is {currWindowTime:(B), lastCount:4, currCount:2}
*	
*	If new request is made on X, it is in the current window. currCount will increase by 1. 	{currWindowTime: B, lastCount: 4, currCount: 3}
*	If made on Y, C-D becomes the current window. 												{currWindowTime: C, lastCount: 2, currCount: 1}
*	If made on Z, more than 1 window period has passed. Z will be the new window start time. 	{currWindowTime: Z, lastCount: 0, currCount: 1}
*
*	A weighted count is calculated based on where the current time lands within the window period.
*	Assume time A is 12:00am, B is 12:01am, C is 12:02am, i.e. window size is 1 minute.
*	If new request is made on X, 12:01:40am, the estimated weighted count from 12:00:40 to 12:01:40 is
*		Last window remaining count + Current window count 
*		= ((60-40)/60)*4 + 3
*		= 4.333
*	If the request limit is 4 requests per minute, the new request on X will be denied.
*	
*/

/*	3 levels of request limiting 
*	NORMAL: Normal, if the request rate exceeds the limit, go to RESTRICT.
*	RESTRICT: Restrict the number of allowable request from the user. If user exceeds this limit, go to BAN. If the RESTRICT duration has passed, go to NORMAL.
*	BLOCK: All requests from the user are denied. If the BLOCK duration has passed, go to NORMAL.
*/

const REQUEST_LIMIT_LEVEL_NORMAL = 0;
const REQUEST_LIMIT_LEVEL_RESTRICT = 1; //If throttling is not used, replace with 0
const REQUEST_LIMIT_LEVEL_BLOCK = 2; //If throttling is not used, replace with 0
const REQUEST_LIMIT_NORMAL_WINDOW = process.env.REQUEST_LIMIT_NORMAL_WINDOW * 1000; //Convert sec to millisec
const REQUEST_LIMIT_NORMAL_COUNT = process.env.REQUEST_LIMIT_NORMAL_COUNT;
const REQUEST_LIMIT_RESTRICT_WINDOW = process.env.REQUEST_LIMIT_RESTRICT_WINDOW * 1000;
const REQUEST_LIMIT_RESTRICT_COUNT = process.env.REQUEST_LIMIT_RESTRICT_COUNT;
const REQUEST_LIMIT_RESTRICT_DURATION = process.env.REQUEST_LIMIT_RESTRICT_DURATION * 1000;
const REQUEST_LIMIT_BLOCK_DURATION = process.env.REQUEST_LIMIT_BLOCK_DURATION * 1000;

var reqUserList = {};
/*	Each reqUser entry will be 
*	'0.0.0.0':{currWindowTime:0, lastCount:0, currCount:0, level:0, levelEndTime: 0}	
*
*/

function reqUserInit(currWindowTime, lastCount, currCount, level, levelEndTime){
	return {currWindowTime:currWindowTime, 
			lastCount:lastCount, 
			currCount:currCount, 
			level:level, 
			levelEndTime: levelEndTime};
}

function reqLimitCheck(req, callback){
	var result;
	//True means allow request, false means deny request
	var ip = req.headers['x-forwarded-for'] ? 
		req.headers['x-forwarded-for'].split(',')[0] : 
		req.connection.remoteAddress;
	//Can't get IP from request, just deny request
	if(!ip) result = false;
	
	const currTime = Date.now();
	//New entry
	if(reqUserList[ip] === undefined){
		reqUserList[ip] = reqUserInit(currTime, 0, 0, REQUEST_LIMIT_LEVEL_NORMAL, 0);
	}
	
	//Existing entry
	var reqUser = reqUserList[ip];
	switch (reqUser.level){
		case REQUEST_LIMIT_LEVEL_NORMAL: {
			if(reqLimitCalc(reqUser, REQUEST_LIMIT_NORMAL_WINDOW, REQUEST_LIMIT_NORMAL_COUNT, currTime)){
				reqUserList[ip] = reqUser;
				result = true;
			}
			else {
				reqUser.level = REQUEST_LIMIT_LEVEL_RESTRICT;	//Increase one level
				reqUser.levelEndTime = currTime + REQUEST_LIMIT_RESTRICT_DURATION;
				reqUserList[ip] = reqUser;
				result = false;
			}
			break;
		}
		case REQUEST_LIMIT_LEVEL_RESTRICT: {
			if(reqLimitCalc(reqUser, REQUEST_LIMIT_RESTRICT_WINDOW, REQUEST_LIMIT_RESTRICT_COUNT, currTime)){
				if (currTime >= reqUser.levelEndTime){
					reqUser.level = REQUEST_LIMIT_LEVEL_NORMAL; //Drop to normal
				}
				reqUserList[ip] = reqUser;
				result = true;
			}
			else {
				reqUser.level = REQUEST_LIMIT_LEVEL_BLOCK;	//Increase one level
				reqUser.levelEndTime = currTime + REQUEST_LIMIT_BLOCK_DURATION;
				reqUserList[ip] = reqUser;
				result = false;
			}
			break;
		}
		case REQUEST_LIMIT_LEVEL_BLOCK: {
			if (currTime >= reqUser.levelEndTime){ 
				reqUser.level = REQUEST_LIMIT_LEVEL_NORMAL;
				reqUserList[ip] = reqUser;
				result = true;
			}
			else {
				result = false;
			}
			break;
		}
		default:{
			result = false;
			break;				
		}
	}
	callback(null, {result:result, record:reqUser});
}

function reqLimitCalc(reqUser, limitWindow, limitCount, currTime){
	const timePassed = currTime - reqUser.currWindowTime;
	if(timePassed >= limitWindow * 2){
		//Set new window start time
		reqUser.currWindowTime = currTime;
		reqUser.lastCount = 0;
		reqUser.currCount = 1;
		return true;
	}
	else if (timePassed >= limitWindow){
		reqUser.currWindowTime += limitWindow;
		reqUser.lastCount = reqUser.currCount;
		reqUser.currCount = 1;	
		//Last window remaining count + current window count
		if (((limitWindow + reqUser.currWindowTime - currTime) * reqUser.lastCount / limitWindow) + 1 > limitCount){
			return false;
		}
		else {
			return true;
		}
	}
	else if (timePassed >= 0){
		reqUser.currCount += 1;
		if (((limitWindow + reqUser.currWindowTime - currTime) * reqUser.lastCount / limitWindow) + reqUser.currCount > limitCount){
			return false;
		}
		else {
			return true;
		}
	}
	else {return false;}
}

//Set interval to clear reqUserList regularly
function reqUserListClear(){
	const currTime = Date.now();
	for (var ip in reqUserList) {
		if (reqUserList[ip].level === REQUEST_LIMIT_LEVEL_NORMAL && (currTime - reqUserList[ip].currWindowTime) >  REQUEST_LIMIT_NORMAL_WINDOW*2)
		delete reqUserList[ip];
	}
}
setInterval(reqUserListClear, REQUEST_LIMIT_NORMAL_WINDOW*5);

var m = {
	check: reqLimitCheck
}

module.exports = m;