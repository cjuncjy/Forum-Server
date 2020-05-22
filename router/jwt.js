const jwt = require("express-jwt");

const { PRIVATE_KEY, FRONTED_PASS_ROUTE } = require("../utils/constant");

module.exports = jwt({
  secret: PRIVATE_KEY,
  credentialRequired: true
}).unless({
  // jwt认证白名单
  path: ["/", "/admin/user/login", ...FRONTED_PASS_ROUTE]
});
