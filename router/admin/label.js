const express = require("express");
const Result = require("../../models/Result");
const {
  getLabelList,
  getLabelInfo,
  createOrUpdate,
  deleteLabel,
  getLabelsBySortId
} = require("../../services/admin/label");
const { getAllLabels } = require("../../services/fronted/label");
const { querySum } = require("../../db/index");
const boom = require("boom");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// tag列表
router.get("/list", async (req, res) => {
  let totalCount;
  console.log(req.query);
  const { name, sortId } = req.query;
  let addtion = " where 1 = 1";
  if (sortId) {
    addtion += ` and sort_id= '${sortId}'`;
  }
  if (name) {
    addtion += ` and label_name like '%${name}%'`;
  }
  const num = await querySum("labels", addtion);
  totalCount = num[0].count;
  getLabelList(req).then(result => {
    new Result(result, "success", { totalCount }).success(res);
  });
});

// 获取单个信息
router.get("/info", (req, res) => {
  getLabelInfo(req.query.id).then(result => {
    new Result(result, "success").success(res);
  });
});

// 新增或修改
router.post(
  "/createOrUpdate",
  [
    check("name").notEmpty().withMessage("标签名不能为空"),
    check("sortId").notEmpty().withMessage("所属分类不能为空")
  ],
  (req, res) => {
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

router.post("/delete", (req, res) => {
  deleteLabel(req.body.id).then(() => {
    new Result("success").success(res);
  });
});

// 根据sort_id获取所属的labels
router.get("/labelsBySort", (req, res) => {
  getLabelsBySortId(req.query.id).then(result => {
    new Result(result, "success").success(res);
  });
});

// 获取所有的label列表
router.get("/labelAll", (req, res) => {
  getAllLabels().then(result => {
    new Result(result, "success").success(res);
  });
});

module.exports = router;
