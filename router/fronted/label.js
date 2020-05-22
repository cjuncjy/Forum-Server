const express = require("express");
const Result = require("../../models/Result");
const { getAllLabels } = require("../../services/fronted/label");

const router = express.Router();

// 获取标签墙
router.get("/labelAll", (req, res) => {
  getAllLabels().then(result => {
    new Result(result, "success").success(res);
  });
});

module.exports = router;
