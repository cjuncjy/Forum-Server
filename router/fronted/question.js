const express = require("express");
const Result = require("../../models/Result");
const {
  getSortLabelTree,
  createOrUpdateQuest,
  questDetails,
  commentQuest,
  getCommentList,
  updateViewCount,
  likeQuest,
  getIsLikedAndCount,
  getQuestList,
  adoptedComment,
  getMyLikedQuestList
} = require("../../services/fronted/question");

const { deleteQuest } = require("../../services/admin/quest");

const { decoded } = require("../../utils/index");
const router = express.Router();

// 获取分类-标签树
router.get("/sortLabelTree", (req, res) => {
  getSortLabelTree().then(result => {
    new Result(result, "success").success(res);
  });
});

// 新增问题
router.post("/createOrUpdateQuest", (req, res) => {
  const decode = decoded(req);
  if (decode && decode.id) {
    req.body.userId = decode.id;
  }
  createOrUpdateQuest(req).then(result => {
    // console.log(result);
    if (req.body.id) {
      result.insertId = req.body.id;
    }
    new Result(result, "success").success(res);
  });
});

// 问题详情
router.get("/details", async (req, res) => {
  const decode = decoded(req);
  if (decode && decode.id) {
    req.body.userId = decode.id;
    await updateViewCount(req); // 登录了的用户才需要
  }
  // 获取详情的时候要新增阅读人数
  // 判断是否点赞和获取点赞人数
  const obj = await getIsLikedAndCount(req);
  questDetails(req).then(result => {
    result.isLiked = obj.isLiked;
    result.likes = obj.count;
    new Result(result, "success").success(res);
  });
});

// 评论问题
router.post("/comment", (req, res) => {
  const decode = decoded(req);
  if (decode && decode.id) {
    req.body.fromUserId = decode.id;
  }
  commentQuest(req).then(result => {
    new Result("success").success(res);
  });
});

// 获取评论列表
router.get("/commentList", (req, res) => {
  getCommentList(req).then(result => {
    new Result(result, "success").success(res);
  });
});

// 问题点赞
router.post("/like", (req, res) => {
  const decode = decoded(req);
  if (decode && decode.id) {
    req.body.userId = decode.id;
  }
  likeQuest(req).then(result => {
    new Result("success").success(res);
  });
});

// 获取问题分页列表
router.get("/list", (req, res) => {
  const { labelId, myList } = req.query;
  getQuestList(req, labelId, myList).then(result => {
    new Result(result.list, "success", {
      totalCount: result.totalCount
    }).success(res);
  });
});

// 获取我的点赞的问题列表
router.get("/myLiked", (req, res) => {
  getMyLikedQuestList(req).then(result => {
    new Result(result.list, "success", {
      totalCount: result.totalCount
    }).success(res);
  });
});

// 采纳评论
router.post("/adopted", (req, res) => {
  const { questionId, commentId } = req.query;
  adoptedComment(commentId, questionId).then(result => {
    new Result("success").success(res);
  });
});

// 删除
router.post("/delete", (req, res) => {
  deleteQuest(req.query.id).then(result => {
    new Result("success").success(res);
  });
});

module.exports = router;
