const { querySql, queryOne } = require("../../db/index");
const moment = require("moment");

// 验证是否唯一
function validOnly(key, value) {
  return queryOne(`select user_id from users where ${key} = '${value}'`);
}

// 插入code
async function insertCode(email, code) {
  // 先判断该用户有没有插入过数据，有的话直接更新
  let res = await queryOne(`select id from mail_code where email = '${email}'`);
  console.log(res);
  let createAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  if (res) {
    return querySql(
      `update mail_code set code = '${code}', createAt='${createAt}' where id = '${res.id}'`
    );
  } else {
    return querySql(
      `insert into mail_code (code,email,createAt) values ('${code}', '${email}', '${createAt}')`
    );
  }
}

module.exports = { validOnly, insertCode };
