const { querySql, queryOne } = require("../../db");
const { md5 } = require("../../utils/index");
const { PWD_SALT } = require("../../utils/constant");

const USERINFO_EXCEPT_PASS = `select user_id as id,
user_name as username,
user_email as email, 
user_phone as phone, 
user_roles as roles,
user_description as description,
user_avatar_id as avatar_id,
f.file_path as path
from users u
left JOIN file f ON f.file_id = u.user_avatar_id`;

const USERINFO = `select user_id as id,
user_name as username,
user_password as password,
user_email as email, 
user_phone as phone, 
user_roles as roles,
user_description as description,
user_avatar_id as avatar_id,
f.file_path as path
from users u
left JOIN file f ON f.file_id = u.user_avatar_id`;

function login(username, password) {
  // console.log(username, password);
  return querySql(
    `select * from users where user_name='${username}' and user_password = '${password}'`
  );
}

function findUser(username) {
  return queryOne(`${USERINFO_EXCEPT_PASS} where user_name='${username}'`);
}

function getUserList(req) {
  const { username, pageIndex, pageSize } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  return querySql(
    `${USERINFO_EXCEPT_PASS} where user_name like '%${username}%' LIMIT ${firstIndex},${pageSize}`
  );
}

function getInfoById(userId) {
  return querySql(`${USERINFO} where user_id = '${userId}'`);
}

// 更新用户
function updateUser(req) {
  let {
    id,
    username,
    email,
    phone,
    roles,
    password,
    description,
    avatarId
  } = req.body;
  description = description || "";

  let sql = `UPDATE users
  SET user_name='${username}',`;

  // 判断是否修改了密码
  if (password) {
    password = md5(`${password}${PWD_SALT}`);
    sql += `user_password='${password}',`;
  }
  if (roles) {
    roles = roles.join(",");
    sql += `user_roles='${roles}',`;
  }

  sql += `user_email='${email}',
  user_phone='${phone}',
  user_description='${description}', 
  user_avatar_id = '${avatarId}' 
  WHERE user_id='${id}'`;

  return querySql(sql);
}

function createUser(req) {
  let { username, email, phone, roles, password, avatarId } = req.body;
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

function deleteUser(id) {
  return querySql(`DELETE FROM users
  WHERE user_id='${id}'`);
}

function getAllUser() {
  return querySql(`select user_name as name,user_id as id from users`);
}

function getUserImgFile(img_id) {
  return queryOne(`SELECT
	f.file_id AS id,
	f.file_name AS name,
	f.file_path AS path 
FROM
	file f
	WHERE f.file_id = '${img_id}'`);
}

module.exports = {
  login,
  findUser,
  getUserList,
  getInfoById,
  updateUser,
  createUser,
  deleteUser,
  getAllUser,
  getUserImgFile
};
