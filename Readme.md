## 项目概述
> 本项目是学习 vue 和 node 过程中自己练手的一个博客论坛 demo

[管理系统地址戳这里](https://github.com/cjuncjy/Forum-Admin)  
[前台页面地址戳这里](https://github.com/cjuncjy/Forum-Front)
### 项目初始准备

1.middleware 文件夹下面的 nodemailer 文件，需要填写自己的邮箱和申请的授权码

```javascript
auth: {
  user: "xxxxx@xxx.com", //这里填写你的邮箱地址
  pass: "xxxxxx" // 你申请的邮箱的授权码
}
```

2.数据库文件导入和修改 db 文件夹下面 config 的配置(表文件在根目录下)

```javascript
module.exports = {
  host: "xxxx",
  user: "xxxx",
  password: "xxxx",
  database: "xxxx"
};
```

3.配置 nginx 反向代理
在你电脑任意位置新建一个 upload 文件夹用来存放上传的照片，然后在项目或者 upload 文件夹里面新建一个 upload.conf 文件(位置随意，记得就好)

```nginx
# upload.conf
# root填你刚刚新建的upload文件夹的位置
server {
	charset utf-8;
	listen 8089;
	server_name http_host;
	root xxxx/upload; #这里填你的upload文件夹的位置
	autoindex on;
	add_header Cache-Control "no-cache, must-revalidate";
	location / {
		add_header Access-Control-Allow-Origin *;
	}
}
```

然后去你电脑安装 nginx 的目录下找到 conf 文件夹下面的 nginx.conf 文件，修改一下文件：

```nginx
#nginx.conf
http {
  # 上面的配置不用管，在最下面新增这一行
  include xxx/upload.conf; #这里填你刚刚新建的upload.conf的地址
}
```

然后启动 nginx

4.修改项目 utils 文件夹里面的 constant 里面的 upload 地址：

```
const UPLOAD_PATH = "填上你上面新建的upload文件夹的地址";
```

### 项目启动

```
npm install
```

### 项目运行

```
npm run dev
```
