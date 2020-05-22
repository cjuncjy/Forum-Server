const nodemailer = require("nodemailer");

// 创建SMTP服务器对象
const config = {
  host: "smtp.163.com", // 这里填写你的邮箱类型，我用的163
  port: 465,
  auth: {
    user: "xxxxx@xxx.com", //这里填写你的邮箱地址
    pass: "xxxxxx" // 你申请的邮箱的授权码
  }
};

// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);

//发送邮件
module.exports = function (mail) {
  transporter.sendMail(mail, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log("mail sent:", info.response);
  });
};
