# Cartrack Node.js Challenge  
A web service to limit and throttle incoming API request.  
This project is also deployed on [Heroku](https://zqtay-cartrack.herokuapp.com/).  

**Mechanism**  
The request limiter is using sliding window algorithm.  
Further clarification please see [/services/request-limit.js](https://github.com/zqtay/cartrack-nodejs/blob/main/services/request-limit.js).  

3 levels of request limiting:  
``NORMAL``: Normal, if the request rate exceeds the limit, go to RESTRICT.  
``RESTRICT``: Restrict the number of allowable request from the user. If user exceeds this limit, go to BLOCK. If the RESTRICT duration has passed, go to NORMAL.  
``BLOCK``: All requests from the user are denied. If the BLOCK duration has passed, go to NORMAL.  

**Setup**  
``git clone git clone https://github.com/zqtay/cartrack-nodejs``  
``cd cartrack-nodejs``  
``npm install``  

**Config**  
To change the request limit and window size, please edit [/.env](https://github.com/zqtay/cartrack-nodejs/blob/main/.env).  

**Start**  
``node app.js > logs/output.log``  
By default: the server is listening on ``http://localhost:3000``  

