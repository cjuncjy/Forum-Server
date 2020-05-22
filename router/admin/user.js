const express = require("express");
const Result = require("../../models/Result");
const {
  login,
  findUser,
  getUserList,
  getInfoById,
  updateUser,
  createUser,
  deleteUser,
  getAllUser,
  getUserImgFile
} = require("../../services/admin/user");
const { md5, decoded } = require("../../utils");
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../../utils/constant");
const { check, validationResult } = require("express-validator");
const boom = require("boom");
const jwt = require("jsonwebtoken");
const { querySum } = require("../../db/index");

const router = express.Router();

// 当前登录用户的基本信息
// /admin/user/info
router.get("/info", (req, res) => {
  // 解析jwt
  const decode = decoded(req); // 解析出jwt里面的内容
  if (decode && decode.username) {
    findUser(decode.username).then(user => {
      if (user) {
        new Result(user, "用户信息查询成功").success(res);
      } else {
        new Result("用户信息查询失败").fail(res);
      }
    });
  } else {
    new Result("用户信息查询失败").fail(res);
  }
});

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
            new Result("登录失败，用户名或密码有错").fail(res);
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

// 获取用户列表
router.get("/list", async (req, res) => {
  // 获取到用户列表然后返回
  let totalCount;
  let result;
  if (req.query.username) {
    result = await querySum(
      "users",
      " where user_name like '%" + req.query.username + "%'"
    );
  } else {
    result = await querySum("users");
  }
  totalCount = result[0].count;
  getUserList(req).then(userList => {
    new Result(null, "查询成功", {
      userList,
      totalCount
    }).success(res);
  });
});

// 根据id获取用户信息
router.get("/infoDetails", (req, res) => {
  const userId = req.query.id;
  getInfoById(userId).then(async userinfo => {
    const result = userinfo[0];
    result.roles = result.roles.split(",");
    const file = await getUserImgFile(result.avatar_id);
    result.file = file;
    if (result) {
      new Result(result, "success").success(res);
    } else {
      new Result(null, "获取信息失败").fail(res);
    }
  });
});

// 创建或者更新用户
router.post(
  "/createOrUpdate",
  // 数据校验
  [
    check("email").isEmail().withMessage("邮箱地址不符合规范"),
    check("phone").isMobilePhone().withMessage("手机号码不符合规范"),
    check("roles").notEmpty().withMessage("角色不能为空")
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

// 删除用户
router.post("/delete", (req, res) => {
  deleteUser(req.body.id).then(result => {
    new Result("success").success(res);
  });
});

// 所有用户的下拉列表
router.get("/listAll", (req, res) => {
  getAllUser(req.body.id).then(result => {
    new Result(result, "success").success(res);
  });
});

module.exports = router;
