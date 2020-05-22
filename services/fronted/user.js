const { querySql, queryOne } = require("../../db");
const { md5 } = require("../../utils/index");
const { PWD_SALT } = require("../../utils/constant");

async function createUser(req) {
  let { username, email, phone, roles, password, avatarId, code } = req.body;

  // 去数据库获取code并对比
  const res = await queryOne(`select * from mail_code where email='${email}'`);
  let isTimeout =
    new Date().getTime() - new Date(res.createAt).getTime() > 1000 * 60 * 10; // 十分钟期限
  if (!res || res.code !== code) {
    throw { flag: false, msg: "验证码错误" };
  } else if (isTimeout) {
    throw { flag: false, msg: "验证码超时，请重新发送" };
  } else {
    // console.log(req.body);
    password = md5(`${password}${PWD_SALT}`);
    // console.log(password);
    roles = roles.join(",");
    avatarId = avatarId ? avatarId : 1;
    return querySql(`INSERT INTO users 
 (user_name,user_password,user_email,user_phone,user_roles,user_avatar_id)
 VALUES 
 ('${username}','${password}','${email}','${phone}','${roles}', '${avatarId}')`);
  }
}

module.exports = {
  createUser
};
