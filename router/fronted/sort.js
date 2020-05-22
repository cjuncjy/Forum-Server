const express = require("express");
const Result = require("../../models/Result");
const { getSortAndNum } = require("../../services/fronted/sort");
const { getSortAll } = require("../../services/admin/sort");

const router = express.Router();

// 获取列表加上在文章表出现的次数
router.get("/sortNum", (req, res) => {
  getSortAndNum().then(result => {
    result.forEach(_ => {
      if (_.count === null) {
        _.count = 0;
      }
    });
    new Result(result, "success").success(res);
  });
});

// 获取所有的分页列表（做下拉）
router.get("/sortAll", (req, res) => {
  getSortAll().then(result => {
    new Result(result, "success").success(res);
  });
});

module.exports = router;
