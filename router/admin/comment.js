const express = require("express");
const Result = require("../../models/Result");
const {
  getArticleComment,
  getDetails,
  createOrUpdate,
  deleteComment,
  getQuestComment
} = require("../../services/admin/comment");

const router = express.Router();

// 文章的评论列表
router.get("/articleComment", (req, res) => {
  getArticleComment(req).then(result => {
    new Result(result.list, "success", {
      totalCount: result.totalCount
    }).success(res);
  });
});

// 问答的评论列表
router.get("/questComment", (req, res) => {
  getQuestComment(req).then(result => {
    new Result(result.list, "success", {
      totalCount: result.totalCount
    }).success(res);
  });
});

// 文章评论的某一条详情
router.get("/commentDetails", (req, res) => {
  getDetails(req.query.id, req.query.isQuest).then(result => {
    new Result(result, "success").success(res);
  });
});

// 新增文章评论
router.post("/createOrUpdate", (req, res) => {
  createOrUpdate(req.body, req.query.isQuest).then(result => {
    new Result(result, "success").success(res);
  });
});

// 删除评论
router.post("/delete", (req, res) => {
  deleteComment(req.query.id, req.query.isQuest).then(() => {
    new Result("success").success(res);
  });
});

module.exports = router;
