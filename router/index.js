const express = require("express");
const boom = require("boom");
// admin的
const userRouter = require("./admin/user");
const sortRouter = require("./admin/sort");
const labelRouter = require("./admin/label");
const articleRouter = require("./admin/article");
const uploadRouter = require("./admin/upload");
const commentRouter = require("./admin/comment");
const questRouter = require("./admin/quest");
// fronted的
const homeRouter = require("./fronted/home");
const sortFronted = require("./fronted/sort");
const labelFronted = require("./fronted/label");
const articleFronted = require("./fronted/article");
const userFronted = require("./fronted/user");
const questionFronted = require("./fronted/question");
const mailFronted = require("./fronted/mail");

const jwtAuth = require("./jwt");
const Result = require("../models/Result");
// 注册路由
const router = express.Router();

// 统一的jwt拦截，如果token不对就返回401给前台
router.use(jwtAuth); // 启动jwt认证

router.get("/", (req, res) => {
  res.send("hello world");
});

// 管理系统
router.use("/admin/user", userRouter);
router.use("/admin/sort", sortRouter);
router.use("/admin/label", labelRouter);
router.use("/admin/article", articleRouter);
router.use("/admin/upload", uploadRouter);
router.use("/admin/comment", commentRouter);
router.use("/admin/quest", questRouter);

// 主页面
router.use("/fronted/home", homeRouter);
router.use("/fronted/sort", sortFronted);
router.use("/fronted/label", labelFronted);
router.use("/fronted/article", articleFronted);
router.use("/fronted/user", userFronted);
router.use("/fronted/upload", uploadRouter);
router.use("/fronted/quest", questionFronted);
router.use("/fronted/mail", mailFronted);

/**
 * 集中处理404请求的中间件
 * 注意：该中间件要放在正常处理流程之后
 * 否则会拦截正常请求
 */
router.use((req, res, next) => {
  next(boom.notFound("接口不存在"));
});

/**
 * 自定义路由异常处理中间件
 * 注意两点：
 * 1.方法参数不能少
 * 2.方法必须放在路由最后
 */
router.use((err, req, res, next) => {
  if (err.name && err.name === "UnauthorizedError") {
    // token错误
    const { status = 401, message } = err;
    new Result(null, "Token验证失败", {
      error: status,
      errMsg: message
    }).jwtError(res.status(status));
  } else {
    const msg = (err && err.message) || "系统错误";
    const statusCode = (err.output && err.output.statusCode) || 500;
    const errorMsg =
      (err.output && err.output.payload && err.output.payload.error) ||
      err.message;
    new Result(null, msg, {
      error: statusCode,
      errorMsg
    }).fail(res.status(statusCode));
  }
});

module.exports = router;
