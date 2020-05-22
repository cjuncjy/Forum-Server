const _ = require("underscore");

function IO(io) {
  let hasName = {}; // 以userId为键，socketId为值
  let unreadMessage = {}; // 在线未读
  // socket.io配置
  io.on("connection", function (socket) {
    console.log("a user connected");

    // 用户登录时候的用户名注册
    socket.on("setName", function (data) {
      let userId = data.userId;
      hasName[userId] = socket.id;
      console.log("hasName数组：", hasName);
      // 上线后，如果该用户有未读消息，发未读消息给用户
      if (unreadMessage[userId]) {
        unreadMessage[userId].forEach(item => {
          privateSocket(socket.id, io).emit("message", item);
        });
        unreadMessage[userId] = [];
      }
    });

    // 给对方喊话
    socket.on("sayTo", function (data) {
      console.log(data);
      const { fromUserId, toUserId, content } = data;
      if (hasName[toUserId]) {
        // 发送的目标用户必须是之前已经登录过的
        let toUserSocketId = hasName[toUserId];
        try {
          // 在线
          privateSocket(toUserSocketId, io).emit("message", data);
        } catch (e) {
          // 对方离线
          // console.log(e);
          console.log("对方离线了");
          // 将消息存到未读数组，然后等用户上线再发过去
          if (!unreadMessage[toUserId]) {
            unreadMessage[toUserId] = [];
          }
          unreadMessage[toUserId].push(data);
        }
      }
    });

    // 用户下线前未读的信息，暂存到未读数组中
    socket.on("nextTimeRead", function (data) {
      const { toUserId } = data;
      console.log("nextTimeRead", data);
      if (!unreadMessage[toUserId]) {
        unreadMessage[toUserId] = [];
      }
      unreadMessage[toUserId].push(data);
    });

    // 断线
    socket.on("disconnect", function () {
      console.log("a user go out");
    });
  });
}

//提供私有socket
function privateSocket(toId, io) {
  return _.findWhere(io.sockets.sockets, { id: toId });
}

module.exports = IO;
