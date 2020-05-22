const express = require("express");
const sendMail = require("../../middleware/nodemailer");
const Result = require("../../models/Result");
const { createSixNum } = require("../../utils/index");
const { validOnly, insertCode } = require("../../services/fronted/mail");

const router = express.Router();

// 发邮件
router.get("/sendEmail", async (req, res) => {
  const { email, username } = req.query;
  let code = await createSixNum(); //生成的随机六位数

  // 先看看用户名和邮箱是否已经被注册了
  let result = await validOnly("user_name", username);
  if (result) {
    new Result("用户名已经被注册").fail(res);
    return;
  }
  result = await validOnly("user_email", email);
  if (result) {
    new Result("邮箱已经被注册").fail(res);
    return;
  }

  // 发短信
  let mail = {
    // 发件人
    from: "<xxx@163.com>",
    // 主题
    subject: "在线学习平台注册邮箱验证码", //邮箱主题
    // 收件人
    to: email, //前台传过来的邮箱
    // 邮件内容，HTML格式
    text:
      "您正在注册在线学习平台账号，验证码是：" +
      code +
      ", 验证码在十分钟内有效，如果不是您本人操作，那么可以无视这条消息。" //发送验证码
  };

  // 这里先用数据库代替缓存
  insertCode(email, code)
    .then(() => {
      // 发送邮件
      sendMail(mail);
      new Result("success").success(res);
    })
    .catch(err => {
      new Result(err, "发送失败").fail(res);
    });
});

module.exports = router;
