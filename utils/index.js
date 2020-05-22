const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { PRIVATE_KEY } = require("./constant");
/**
 * 给字符串使用md5加密
 * @param {*} s 需要加密的字符串
 */
function md5(s) {
  return crypto.createHash("md5").update(String(s)).digest("hex");
}

/**
 * jwt解析
 * @param {*} req 请求对象
 */
function decoded(req) {
  let token = req.get("Authorization");
  if (token && token.indexOf("Bearer") === 0) {
    token = token.replace("Bearer ", "");

    return jwt.verify(token, PRIVATE_KEY);
  }
}

/**
 * 创建6位随机数
 */
function createSixNum() {
  var Num = "";
  for (var i = 0; i < 6; i++) {
    Num += Math.floor(Math.random() * 10);
  }
  return Num;
}

module.exports = {
  md5,
  decoded,
  createSixNum
};
