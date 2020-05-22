const { querySql } = require("../../db/index");
const { UPLOAD_PATH } = require("../../utils/constant");
const fs = require("fs");

const IMG_ALL_PATH = UPLOAD_PATH + "\\img";

function insertImg(req) {
  const file = req.file;
  let suffix = "." + file.originalname.split(".")[1]; // 后缀
  let filename = file.filename;
  // 对保存了的文件重命名
  fs.renameSync(
    `${IMG_ALL_PATH}\\${filename}`,
    `${IMG_ALL_PATH}\\${filename}${suffix}`,
  );
  req.file.filename = `${filename}${suffix}`;
  let filePath = "/img/" + req.file.filename; // 路径
  return querySql(`INSERT INTO
  file ( file_name, file_type,file_path )
  VALUES
  ( '${file.filename}', 0, '${filePath}' ); `);
}

// 删除数据库的文件记录
function deleteImgById(id) {
  return querySql(`delete from file where file_id = '${id}'`);
}

// 删除已经上传到本地的文件
function removeLocalImg(filename) {
  let curPath = IMG_ALL_PATH + "\\" + filename;
  fs.unlink(curPath, (err) => {
    if (err) {
      console.log("删除失败，原因：" + err);
    }
  });
}

module.exports = {
  insertImg,
  deleteImgById,
  removeLocalImg,
};
