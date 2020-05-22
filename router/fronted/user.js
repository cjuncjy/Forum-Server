const express = require("express");
const Result = require("../../models/Result");
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../../utils/constant");
const { md5, decoded } = require("../../utils");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { login, updateUser, getInfoById } = require("../../services/admin/user");
const { createUser } = require("../../services/fronted/user");
const {
  createOrUpdte,
  updateArticleLabel
} = require("../../services/admin/article");
const { getMyArticle } = require("../../services/fronted/article");
const boom = require("boom");

const router = express.Router();

router.post(
  "/login",
  [
    check("username").isString().withMessage("用户名必须是字符串"),
    check("password").isString().withMessage("密码必须为字符")
  ],
  (req, res, next) => {
    const err = validationResult(req); // validator校验的结果
    if (!err.isEmpty()) {
      // 错误处理
      const msg = err.errors[0].msg;
      next(boom.badRequest(msg));
    } else {
      let { username, password } = req.body;

      password = md5(`${password}${PWD_SALT}`); // md5加盐

      login(username, password)
        .then(user => {
          // console.log(password);
          if (!user || user.length === 0) {
            new Result("登录失败，用户名或密码错误").fail(res);
          } else {
            // 生成token
            const [_user] = user;
            const token = jwt.sign(
              { username, id: _user.user_id },
              PRIVATE_KEY,
              { expiresIn: JWT_EXPIRED }
            );
            new Result({ token }, "登录成功").success(res);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
);

// 创建或更新用户
router.post(
  "/registOrUpdate",
  // 数据校验
  [
    check("email").notEmpty().withMessage("邮箱不能为空"),
    check("username").notEmpty().withMessage("用户名不能为空"),
    check("email").isEmail().withMessage("邮箱地址不符合规范"),
    check("phone").isMobilePhone().withMessage("手机号码不符合规范")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 错误处理
      const msg = errors.errors[0].msg;
      next(boom.badRequest(msg));
    } else {
      const { id } = req.body;
      if (id) {
        // 更新
        updateUser(req)
          .then(result => {
            new Result("success").success(res);
          })
          .catch(err => {
            new Result(null, "服务出错", err).fail(res);
          });
      } else {
        // 创建
        req.body.roles = ["normal"]; // 普通用户
        createUser(req)
          .then(result => {
            new Result("success").success(res);
          })
          .catch(err => {
            new Result(null, "服务出错", err).fail(res);
          });
      }
    }
  }
);

// 获取用户信息
router.get("/info", (req, res) => {
  const decode = decoded(req);
  let id = decode && decode.id;
  getInfoById(id).then(result => {
    delete result[0].password;
    new Result(result[0], "success").success(res);
  });
});

// 用户创建文章
router.post("/createOrUpdateArticle", (req, res) => {
  const decode = decoded(req);
  req.body.userId = decode && decode.id;
  createOrUpdte(req).then(result => {
    req.body.articleId = result.insertId || req.body.id;
    // 这里成功后要更新article和label中间表
    updateArticleLabel(req);
    new Result("success").success(res);
  });
});

// 获取用户的文章
router.get("/myArticle", (req, res) => {
  const decode = decoded(req);
  req.body.userId = decode && decode.id;
  console.log("1", req.query.isLike);
  getMyArticle(req).then(result => {
    new Result(result.list, "success", {
      totalCount: result.totalCount.count
    }).success(res);
  });
});

module.exports = router;
