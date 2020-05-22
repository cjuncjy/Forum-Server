const express = require("express");
const router = require("./router");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("morgan");

const app = express();
const IO = require("./middleware/io");

// socket.io
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);

app.use(cors()); // 解决跨域问题
app.use(bodyParser.urlencoded({ extended: true })); //body参数
app.use(bodyParser.json());
app.use(logger("dev"));

app.use("/", router);

const server = app.listen(5000, () => {
  const { address, port } = server.address();
  console.log("http启动成功: http://%s:%s", address, port);
});

// socketio函数
IO(io);

//开启端口监听socket
httpServer.listen(3001);
