const express = require("express");
const Result = require("../../models/Result");
const { querySum } = require("../../db/index"); // 表中的数据数量计算
const boom = require("boom");
const { check, validationResult } = require("express-validator");
const {
  getOrdinaryList,
  getArticleInfo,
  createOrUpdte,
  updateArticleLabel,
  getArticleFileInfo,
  getHotArticle,
  deleteArticle,
  getFileInfoByArticle
} = require("../../services/admin/article");
const {
  deleteImgById,
  removeLocalImg
} = require("../../services/admin/upload");

const router = express.Router();

// 普通文章列表
router.get("/listOrdinary", async (req, res) => {
  const { sortId } = req.query;
  let addtion = "";
  if (sortId) {
    addtion = " where sort_id=" + sortId;
  }
  const count = await querySum("articles", addtion);
  const totalCount = count[0].count;
  getOrdinaryList(req).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

// 文章详情
router.get("/info", (req, res) => {
  const articleId = req.query.id;
  getArticleInfo(articleId).then(async result => {
    result.labelIds =
      result.labelIds && result.labelIds.split(",").map(_ => parseInt(_));
    // 这里再获取相关的文件的信息
    const fileId = result.avatarId;
    result.file = await getArticleFileInfo(fileId);
    new Result(result, "success").success(res);
  });
});

// 创建或更新
router.post("/createOrUpdate", (req, res) => {
  createOrUpdte(req)
    .then(result => {
      req.body.articleId = result.insertId || req.body.id;
      // 这里成功后要更新article和label中间表
      updateArticleLabel(req);
      new Result("success").success(res);
    })
    .catch(err => {
      console.log(err);
    });
});

// 获取热门的文章 这里的热门是指点赞数到达50以上
router.get("/listHot", async (req, res) => {
  const { sortId } = req.query;
  let addtion = " where article_views>=50 ";
  if (sortId) {
    addtion += " and sort_id=" + sortId;
  }
  const count = await querySum("articles", addtion);
  const totalCount = count[0].count;
  getHotArticle(req).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

router.post(
  "/delete",
  [check("id").notEmpty().withMessage("被删除文章的id不能为空")],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 错误处理
      const msg = errors.errors[0].msg;
      next(boom.badRequest(msg));
    } else {
      const result = await getFileInfoByArticle(req.query.id);
      deleteArticle(req.query.id).then(() => {
        // 删除file表的记录
        deleteImgById(result.id).then(() => {
          removeLocalImg(result.filename);
        });
        new Result("success").success(res);
      });
    }
  }
);
module.exports = router;
