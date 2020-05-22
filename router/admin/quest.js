const express = require("express");
const Result = require("../../models/Result");
const { getList, getInfo, deleteQuest } = require("../../services/admin/quest");
const { createOrUpdateQuest } = require("../../services/fronted/question");
const router = express.Router();

// 后台问题列表
router.get("/list", (req, res) => {
  getList(req).then(result => {
    new Result(result.list, "success", {
      totalCount: result.totalCount
    }).success(res);
  });
});

// 详情
router.get("/info", (req, res) => {
  const { id } = req.query;
  getInfo(id).then(result => {
    new Result(result, "success").success(res);
  });
});

// 新增或修改
router.post("/createOrUpdate", (req, res) => {
  createOrUpdateQuest(req).then(result => {
    new Result(result, "success").success(res);
  });
});

// 删除
router.post("/delete", (req, res) => {
  deleteQuest(req.query.id).then(result => {
    new Result("success").success(res);
  });
});

module.exports = router;
