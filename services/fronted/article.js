const { querySql, queryOne } = require("../../db/index");
const moment = require("moment");

function returnArtSql(isHot, sortId, userId) {
  return `SELECT
	a.article_id AS id,
	a.article_title AS title,
	a.article_summary AS summary,
	a.article_createAt AS createAt,
	a.article_views AS views,
	a.article_comment_count AS commentCount,
	a.article_like_count AS likeCount,
	b.file_path AS imgPath,
	GROUP_CONCAT( l.label_name ) AS labelsName 
FROM
	articles a
	LEFT JOIN file b ON a.article_avatar_id = b.file_id
	LEFT JOIN set_article_label sal ON a.article_id = sal.article_id
	LEFT JOIN labels l ON sal.label_id = l.label_id 
	${isHot ? "WHERE a.article_views>=50" : ""} 
	${sortId ? "WHERE a.sort_id = " + sortId : ""}
	${userId ? "WHERE a.user_id = " + userId : ""}
GROUP BY
  a.article_id
ORDER BY
  a.article_createAt DESC`;
}

// 获取文章的详情
function getArticleDetails(id) {
  return queryOne(`SELECT
	a.article_id AS id,
	b.user_name AS username,
  a.user_id AS userId,
  a.sort_id AS sortId,
	c.sort_name AS sortName,
	a.article_title AS title,
	a.article_content AS content,
	a.article_summary AS summary,
	a.article_views AS views,
	a.article_like_count AS likeCount,
	a.article_comment_count AS commentCount,
  a.article_createAt AS createAt,
  f.file_path AS imgPath,
  f.file_id AS fileId,
  GROUP_CONCAT( l.label_name ) AS labelsName,
  GROUP_CONCAT( l.label_id ) AS labelIds
FROM
	articles a
	LEFT JOIN users b ON a.user_id = b.user_id
	LEFT JOIN sorts c ON c.sort_id = a.sort_id
	LEFT JOIN set_article_label sal ON a.article_id = sal.article_id
  LEFT JOIN labels l ON sal.label_id = l.label_id
  LEFT JOIN file f ON a.article_avatar_id = f.file_id
	WHERE a.article_id = '${id}'
GROUP BY
	a.article_id`);
}

// 根据类别id获取文章
function getArticleBySort(req) {
  const { pageIndex, pageSize, id } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  return querySql(`${returnArtSql(false, id)} LIMIT ${firstIndex},${pageSize}`);
}

// 获取普通文章
function getArticleList(req, isHot) {
  const { pageIndex, pageSize } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  return querySql(`${returnArtSql(isHot)} LIMIT ${firstIndex},${pageSize}`);
}

// 获取个人文章
async function getMyArticle(req) {
  let { pageIndex, pageSize, isLike } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  if (isLike === "false") {
    // 只是个人文章
    console.log("个人");
    const result = await querySql(
      `${returnArtSql(
        false,
        false,
        req.body.userId
      )} LIMIT ${firstIndex},${pageSize}`
    );
    const totalCount = await queryOne(
      `select COUNT(article_id) as count from articles where user_id = '${req.body.userId}'`
    );
    return { list: result, totalCount };
  } else {
    console.log("点赞");
    // 个人点赞的文章
    const result = await querySql(
      `SELECT
      a.article_id AS id,
      a.article_title AS title,
      a.article_summary AS summary,
      a.article_createAt AS createAt,
      a.article_views AS views,
      a.article_comment_count AS commentCount,
      a.article_like_count AS likeCount,
      b.file_path AS imgPath,
      GROUP_CONCAT( l.label_name ) AS labelsName 
    FROM
      article_like al
      LEFT JOIN articles a ON a.article_id = al.article_id
      LEFT JOIN file b ON a.article_avatar_id = b.file_id
      LEFT JOIN set_article_label sal ON a.article_id = sal.article_id
      LEFT JOIN labels l ON sal.label_id = l.label_id 
    WHERE
      al.user_id = '${req.body.userId}' 
    GROUP BY
      a.article_id 
    ORDER BY
      a.article_createAt DESC
    LIMIT ${firstIndex},${pageSize}`
    );
    const totalCount = await queryOne(
      `select COUNT(id) as count from article_like where user_id = '${req.body.userId}'`
    );
    return { list: result, totalCount };
  }
}

// 评论
function comment(req) {
  let { toUserId, fromUserId, articleId, content } = req.body;
  const createAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  if (toUserId === undefined) {
    return querySql(
      `INSERT INTO article_comments (from_user_id, article_id, comment_content,comment_createAt) VALUES ('${fromUserId}','${articleId}','${content}','${createAt}')`
    );
  } else {
    return querySql(
      `INSERT INTO article_comments (from_user_id, to_user_id, article_id, comment_content,comment_createAt) VALUES ('${fromUserId}','${toUserId}','${articleId}','${content}','${createAt}')`
    );
  }
}

// 评论列表
function getCommentList(articleId) {
  return querySql(`SELECT
	c.comment_id AS id,
	c.from_user_id AS fromUserId,
	u1.user_name AS fromUserName,
	f.file_path AS avatarPath,
	u2.user_name AS toUserName,
	c.to_user_id AS toUserId,
	c.article_id AS article_id,
	c.comment_content AS content,
	c.comment_createAt AS createAt 
FROM
	article_comments c
	LEFT JOIN users u1 ON u1.user_id = c.from_user_id
	LEFT JOIN users u2 ON u2.user_id = c.to_user_id
	LEFT JOIN file f ON u1.user_avatar_id = f.file_id 
WHERE
	article_id = '${articleId}'`);
}

// 数据库中的某一个字段修改
async function updateCommentCount(articleId) {
  const num = await queryOne(
    `select count(*) as count from article_comments where article_id = '${articleId}'`
  );
  await querySql(
    `update articles set article_comment_count = '${num.count}' where article_id = '${articleId}'`
  );
}

// 更新访问数
async function updateViewsCount(articleId, userId) {
  let res = await queryOne(
    `select * from article_views where article_id = '${articleId}' and user_id = '${userId}'`
  );
  if (!res) {
    // 说明之前没有访问过，插入中间表并让articles表中的访问次数+1
    await querySql(
      `insert into article_views (article_id, user_id) values ('${articleId}', '${userId}')`
    );
    const num = await queryOne(
      `select article_views as count from articles where article_id = '${articleId}'`
    );
    await querySql(
      `update articles set article_views = '${++num.count}' where article_id = '${articleId}'`
    );
  }
}

// 点赞功能
async function like(req) {
  const { id, userId } = req.query;
  const result = await querySql(
    `SELECT id FROM \`article_like\` WHERE article_id = '${id}' AND user_id = '${userId}'`
  );
  if (result.length > 0) {
    // 之前已经有点过赞的，应该取消
    return querySql(
      `delete from \`article_like\` where article_id = '${id}' AND user_id = '${userId}'`
    );
  } else {
    // 没有点过赞，补上来
    return querySql(
      `insert into \`article_like\` (article_id, user_id) values ('${id}', '${userId}')`
    );
  }
}

// 获取用户是否点赞过文章
async function isLikeArticle(userId, articleId) {
  const result = await querySql(
    `SELECT id FROM \`article_like\` WHERE article_id = '${articleId}' AND user_id = '${userId}'`
  );
  return !!result.length;
}

// 更新点赞数
async function updateLikeCount(articleId, userId) {
  const num = await querySql(
    `select count(*) as count from \`article_like\` where article_id = '${articleId}' and user_id = '${userId}'`
  );
  return querySql(
    `update articles set article_like_count = '${num[0].count}' where article_id = '${articleId}'`
  );
}

module.exports = {
  getArticleDetails,
  getArticleBySort,
  getArticleList,
  comment,
  getCommentList,
  updateCommentCount,
  updateViewsCount,
  like,
  isLikeArticle,
  updateLikeCount,
  getMyArticle
};
