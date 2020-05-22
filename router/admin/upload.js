const express = require("express");
const multer = require("multer");
const { UPLOAD_PATH } = require("../../utils/constant");
const Result = require("../../models/Result");
const {
  insertImg,
  deleteImgById,
  removeLocalImg,
} = require("../../services/admin/upload");

const router = express.Router();

// 上传照片
router.post(
  "/img",
  multer({ dest: `${UPLOAD_PATH}/img` }).single("file"), // 上传文件的路径
  (req, res) => {
    if (!req.file || req.file.length === 0) {
      new Result("上传失败").fail(res);
    } else {
      insertImg(req).then((result) => {
        const id = result.insertId;
        let path = "/img/" + req.file.filename;
        const { filename, size, mimetype, originalname } = req.file;
        new Result(
          { id, path, filename, size, mimetype, originalname },
          "上传成功",
        ).success(res);
      });
    }
  },
);

// 根据id删除照片
router.delete("/img", (req, res) => {
  deleteImgById(req.query.id).then((result) => {
    removeLocalImg(req.query.filename);
    new Result("success").success(res);
  });
});

module.exports = router;
