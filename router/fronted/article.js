const express = require("express");
const { querySum } = require("../../db/index"); // 表中的数据数量计算
const Result = require("../../models/Result");
const {
  getArticleDetails,
  getArticleBySort,
  getArticleList,
  comment,
  getCommentList,
  updateCommentCount,
  updateViewsCount,
  like,
  isLikeArticle,
  updateLikeCount
} = require("../../services/fronted/article");
const { decoded } = require("../../utils/index");
const {
  deleteArticle,
  getFileInfoByArticle
} = require("../../services/admin/article");
const {
  deleteImgById,
  removeLocalImg
} = require("../../services/admin/upload");

const router = express.Router();

// 获取文章详情
router.get("/details", async (req, res, next) => {
  let decode;
  try {
    decode = decoded(req);
  } catch (error) {
    if (error.name !== "TokenExpiredError") {
      // 超时错误
      return next(error);
    }
  }
  if (decode && decode.id) {
    req.query.userId = decode.id;
  }
  const { id } = req.query;

  // 点赞和阅读数处理
  let isLiked = false;
  if (req.query.userId) {
    // 这里针对已登录的用户，判断是否需要新增阅读次数
    updateViewsCount(id, req.query.userId);
    // 获取用户是否已经赞过文章
    isLiked = await isLikeArticle(req.query.userId, id);
  }

  getArticleDetails(id).then(result => {
    result.isLiked = isLiked;
    new Result(result, "success").success(res);
  });
});

// 获取热门文章
router.get("/hot", async (req, res) => {
  const addtion = "where article_views >= 50";
  const count = await querySum("articles", addtion);
  const totalCount = count[0].count;
  getArticleList(req, true).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

// 获取普通文章
router.get("/ordinary", async (req, res) => {
  const count = await querySum("articles");
  const totalCount = count[0].count;
  getArticleList(req, false).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

// 根据类别id获取文章
router.get("/getBySortId", async (req, res) => {
  const addtion = `where sort_id = '${req.query.id}'`;
  const count = await querySum("articles", addtion);
  const totalCount = count[0].count;
  getArticleBySort(req).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

// 评论功能
router.post("/comment", (req, res) => {
  // 根据token拿到当前用户id
  const decode = decoded(req);
  if (decode && decode.id) {
    req.body.fromUserId = decode.id;
  }
  comment(req).then(async result => {
    // 评论完之后更新文章表中的评论数
    await updateCommentCount(req.body.articleId);
    new Result("successs").success(res);
  });
});

// 评论列表，根据文章id获取
router.get("/commentList", (req, res) => {
  const { id } = req.query;
  getCommentList(id).then(result => {
    new Result(result, "success").success(res);
  });
});

// 点赞文章，根据文章id
router.post("/like", (req, res) => {
  const decode = decoded(req);
  if (decode && decode.id) {
    req.query.userId = decode.id;
  }
  like(req).then(async result => {
    // 更新文章数据中的点赞数
    await updateLikeCount(req.query.id, req.query.userId);
    new Result("success").success(res);
  });
});

router.post("/delete", async (req, res) => {
  const { id } = req.query;
  const result = await getFileInfoByArticle(id);
  deleteArticle(id).then(() => {
    // 删除file表的记录
    deleteImgById(result.id).then(() => {
      removeLocalImg(result.filename);
    });
    new Result("success").success(res);
  });
});

module.exports = router;
