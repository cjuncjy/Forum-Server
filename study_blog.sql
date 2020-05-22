/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80019
 Source Host           : localhost:3306
 Source Schema         : study_blog

 Target Server Type    : MySQL
 Target Server Version : 80019
 File Encoding         : 65001

 Date: 22/05/2020 14:54:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article_comments
-- ----------------------------
DROP TABLE IF EXISTS `article_comments`;
CREATE TABLE `article_comments`  (
  `comment_id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '评论id',
  `from_user_id` bigint(0) NOT NULL COMMENT '谁评论的',
  `to_user_id` bigint(0) NULL DEFAULT NULL COMMENT '评论的谁，这里可以为空，空的话表示直接评论文章',
  `article_id` bigint(0) NOT NULL COMMENT '文章的id',
  `comment_content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '评论的内容',
  `comment_createAt` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '评论的时间',
  PRIMARY KEY (`comment_id`) USING BTREE,
  INDEX `article_id`(`to_user_id`) USING BTREE,
  INDEX `comment_date`(`comment_createAt`) USING BTREE,
  INDEX `parent_comment_id`(`article_id`) USING BTREE,
  INDEX `from_user_id`(`from_user_id`) USING BTREE,
  CONSTRAINT `article_comments_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `article_comments_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 71 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for article_like
-- ----------------------------
DROP TABLE IF EXISTS `article_like`;
CREATE TABLE `article_like`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `article_id` bigint(0) NOT NULL COMMENT '文章id',
  `user_id` bigint(0) NOT NULL COMMENT '点赞者id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for article_views
-- ----------------------------
DROP TABLE IF EXISTS `article_views`;
CREATE TABLE `article_views`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `article_id` bigint(0) NOT NULL,
  `user_id` bigint(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `article_id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '文章id',
  `user_id` bigint(0) NOT NULL COMMENT '用户id',
  `sort_id` bigint(0) NOT NULL COMMENT '分类id',
  `article_avatar_id` bigint(0) NULL DEFAULT NULL COMMENT '文章头像id',
  `article_title` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标题',
  `article_summary` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '摘要',
  `article_content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '内容',
  `article_views` bigint(0) NOT NULL DEFAULT 0 COMMENT '查看人数',
  `article_comment_count` bigint(0) NOT NULL DEFAULT 0 COMMENT '评论人数',
  `article_like_count` bigint(0) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `article_createAt` datetime(0) NOT NULL COMMENT '创建时间',
  `article_updateAt` datetime(0) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`article_id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for file
-- ----------------------------
DROP TABLE IF EXISTS `file`;
CREATE TABLE `file`  (
  `file_id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '文件id',
  `file_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '文件名',
  `file_path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '文件路径',
  `file_type` int(0) NOT NULL COMMENT '文件类型，0为图片',
  PRIMARY KEY (`file_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 127 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for labels
-- ----------------------------
DROP TABLE IF EXISTS `labels`;
CREATE TABLE `labels`  (
  `label_id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '标签id',
  `label_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标签名',
  `label_description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '描述',
  `sort_id` bigint(0) NOT NULL COMMENT '标签所属的分类id',
  PRIMARY KEY (`label_id`) USING BTREE,
  INDEX `label_name`(`label_name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 48 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for mail_code
-- ----------------------------
DROP TABLE IF EXISTS `mail_code`;
CREATE TABLE `mail_code`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `code` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '验证码数字',
  `email` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户邮箱',
  `createAt` datetime(0) NOT NULL COMMENT '验证码生成时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_comments
-- ----------------------------
DROP TABLE IF EXISTS `question_comments`;
CREATE TABLE `question_comments`  (
  `comment_id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '评论id',
  `from_user_id` bigint(0) NOT NULL COMMENT '评论者id',
  `to_user_id` bigint(0) NULL DEFAULT NULL COMMENT '评论的对象的id',
  `question_id` bigint(0) NOT NULL COMMENT '问题id',
  `comment_content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '评论内容',
  `createAt` datetime(0) NULL DEFAULT NULL COMMENT '评论时间',
  PRIMARY KEY (`comment_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_like
-- ----------------------------
DROP TABLE IF EXISTS `question_like`;
CREATE TABLE `question_like`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `question_id` bigint(0) NOT NULL COMMENT '问题id',
  `user_id` bigint(0) NOT NULL COMMENT '点赞者id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_views
-- ----------------------------
DROP TABLE IF EXISTS `question_views`;
CREATE TABLE `question_views`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `question_id` bigint(0) NOT NULL COMMENT '问题id',
  `user_id` bigint(0) NOT NULL COMMENT '访问的用户id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 47 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(0) NOT NULL COMMENT '提问者id',
  `question_title` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '提问的标题',
  `question_content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '提问的内容',
  `comment_adopted_id` bigint(0) NULL DEFAULT NULL COMMENT '被采纳的评论的id',
  `createAt` datetime(0) NULL DEFAULT NULL COMMENT '创建日期',
  `updateAt` datetime(0) NULL DEFAULT NULL COMMENT '更新日期',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for set_article_label
-- ----------------------------
DROP TABLE IF EXISTS `set_article_label`;
CREATE TABLE `set_article_label`  (
  `article_id` bigint(0) NOT NULL,
  `label_id` bigint(0) NOT NULL,
  INDEX `label_id`(`label_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for set_question_label
-- ----------------------------
DROP TABLE IF EXISTS `set_question_label`;
CREATE TABLE `set_question_label`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `question_id` bigint(0) NOT NULL COMMENT '问题id',
  `label_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标签id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sorts
-- ----------------------------
DROP TABLE IF EXISTS `sorts`;
CREATE TABLE `sorts`  (
  `sort_id` bigint(0) NOT NULL AUTO_INCREMENT,
  `sort_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sort_description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `sort_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '分类图',
  PRIMARY KEY (`sort_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `user_id` bigint(0) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_password` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_email` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_roles` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '用户简介',
  `user_avatar_id` bigint(0) NULL DEFAULT NULL COMMENT '用户头像',
  PRIMARY KEY (`user_id`) USING BTREE,
  INDEX `user_avatar_id`(`user_avatar_id`) USING BTREE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_avatar_id`) REFERENCES `file` (`file_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
