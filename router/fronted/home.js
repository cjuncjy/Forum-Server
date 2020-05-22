const express = require("express");
const Result = require("../../models/Result");
const { getRandom5Articles } = require("../../services/fronted/home");
const router = express.Router();

// 获取随机5篇文章
router.get("/randomArticle", (req, res) => {
  getRandom5Articles().then(result => {
    new Result(result, "success").success(res);
  });
});

module.exports = router;
