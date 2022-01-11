var express = require("express");
var router = express.Router();

// parse json payload
router.use(express.json());

let reqCnt = 0;

// middleware that increases reqCnt on every request
router.use(function timeLog(req, res, next) {
  console.log(`request ${reqCnt++}`);
  next();
});

// define the reqcnt api route
router.post("/reqcnt", function (req, res) {
  console.info("reqcnt", req.body);
  res.send(
    JSON.stringify({
      reqCnt,
    })
  );
});

module.exports = router;