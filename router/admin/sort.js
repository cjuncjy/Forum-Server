const express = require("express");
const Result = require("../../models/Result");
const { querySum } = require("../../db/index"); // 表中的数据数量计算
const boom = require("boom");
const {
  getSortList,
  createOrUpdate,
  getSortInfoById,
  deleteSort,
  getSortAll
} = require("../../services/admin/sort");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// 获取分类分页列表
router.get("/list", async (req, res) => {
  let totalCount;
  const { sortName } = req.query;
  let addtion;
  if (sortName) {
    addtion = ` where sort_name like '%${sortName}%'`;
  }
  const num = await querySum("sorts", addtion);
  totalCount = num[0].count;
  getSortList(req).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

// 新增或修改
router.post(
  "/createOrUpdate",
  [check("name").notEmpty().withMessage("分类名不能为空")],
  (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      // 错误处理
      const msg = err.errors[0].msg;
      next(boom.badRequest(msg));
    } else {
      createOrUpdate(req)
        .then(result => {
          new Result("success").success(res);
        })
        .catch(err => {
          new Result(null, "服务异常", err).fail(res);
        });
    }
  }
);

// 获取详情
router.get("/info", (req, res) => {
  getSortInfoById(req.query.id).then(result => {
    new Result(result, "success").success(res);
  });
});

// 删除
router.post("/delete", (req, res) => {
  deleteSort(req.body.id).then(() => {
    new Result("success").success(res);
  });
});

// 获取所有的分页列表（做下拉）
router.get("/listAll", (req, res) => {
  getSortAll().then(result => {
    new Result(result, "success").success(res);
  });
});

module.exports = router;
