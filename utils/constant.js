const UPLOAD_PATH = "xxxx"; // 输入你的文件夹地址
const FRONTED_PASS_ROUTE = [
  "/fronted/home/randomArticle",
  "/fronted/sort/sortAll",
  "/fronted/sort/sortNum",
  "/fronted/article/details",
  "/fronted/login",
  "/fronted/article/ordinary",
  "/fronted/article/hot",
  "/fronted/article/getBySortId",
  "/fronted/article/commentList",
  "/fronted/quest/commentList",
  "/fronted/quest/details",
  "/fronted/quest/list",
  "/fronted/label/labelAll",
  "/fronted/user/login",
  "/fronted/user/registOrUpdate",
  "/fronted/upload/img",
  "/fronted/mail/sendEmail"
];

module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED: -2,
  debug: false,
  PWD_SALT: "blog_salt", // 密码加盐
  PRIVATE_KEY: "blog_private_key",
  JWT_EXPIRED: 60 * 60,
  UPLOAD_PATH,
  FRONTED_PASS_ROUTE
};
