const { querySql, queryOne } = require("../../db/index");

const moment = require("moment");

function getArticleSql(isHot, sortId) {
  return `SELECT
	a.article_id AS id,
	b.user_id AS userId,
	b.user_name AS username,
	c.sort_id AS sortId,
	c.sort_name AS sortName,
	d.file_path AS path,
	a.article_title AS title,
	a.article_summary AS summary,
	a.article_content AS content,
	a.article_views AS views,
	a.article_like_count AS likeCount,
	a.article_comment_count AS commentCount,
	a.article_createAt AS createAt,
	a.article_updateAt AS updateAt,
	GROUP_CONCAT( l.label_name ) AS labelsName
	FROM
	articles a
	LEFT JOIN users b ON a.user_id = b.user_id
	LEFT JOIN sorts c ON c.sort_id = a.sort_id
	LEFT JOIN set_article_label sal ON a.article_id = sal.article_id
	LEFT JOIN labels l ON sal.label_id = l.label_id 
	LEFT JOIN file d ON d.file_id = a.article_avatar_id
	WHERE 1 = 1 
	${isHot ? " and a.article_views>=50" : ""} 
	${sortId ? " and a.sort_id=" + sortId : ""} 
	GROUP BY
	a.article_id`;
}

// 普通文章列表
function getOrdinaryList(req) {
  const { pageIndex, pageSize, sortId } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  return querySql(`${getArticleSql(false, sortId)} 
	LIMIT ${firstIndex},${pageSize}`);
}

// 获取文章详情
function getArticleInfo(id) {
  return queryOne(`SELECT
	a.article_id AS id,
	a.user_id AS userId,
	a.sort_id AS sortId,
	a.article_title AS title,
	a.article_summary AS summary,
	a.article_avatar_id AS avatarId,
	a.article_content AS content,
	GROUP_CONCAT( sal.label_id ) AS labelIds
	FROM
	articles a
	LEFT JOIN set_article_label sal ON a.article_id = sal.article_id
	WHERE a.article_id = '${id}'`);
}

// 创建或更新文章
async function createOrUpdte(req) {
  let { id, userId, sortId, title, content, avatarId, summary } = req.body;
  content = await content.replace(/"/g, "'"); // 把内容中双引号变成单引号
  const updateAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  if (id) {
    // 更新
    return querySql(`UPDATE articles
		SET 
		user_id=\"${userId}\",
    sort_id=\"${sortId}\",
		article_title = \"${title}\",
		article_summary = \"${summary}\",
    article_content = \"${content}\",
    article_avatar_id = \"${avatarId}\",
    article_updateAt = \"${updateAt}\"
    WHERE article_id=\"${id}\"`);
  } else {
    const createAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    // 创建，插入数据库
    return querySql(`INSERT INTO articles
    (user_id, sort_id, article_title, article_summary,article_content, article_avatar_id, article_createAt, article_updateAt)
    VALUES 
    (\"${userId}\",\"${sortId}\",\"${title}\",\"${summary}\",\"${content}\",\"${avatarId}\",\"${createAt}\",\"${updateAt}\")`);
  }
}

// 更新中间表
async function updateArticleLabel(req) {
  try {
    const { articleId, labelIds } = req.body;
    await querySql(
      `delete from set_article_label where article_id = '${articleId}'`
    );
    let sql = "";
    labelIds.forEach(item => {
      sql += `('${articleId}', '${item}'),`;
    });
    sql = sql.substring(0, sql.length - 1);
    await querySql(`insert into set_article_label 
	(article_id, label_id) 
	values 
	${sql}`);
  } catch (e) {
    throw new Error(e);
  }
}

function getArticleFileInfo(fileId) {
  return queryOne(`select 
	f.file_id as id, 
	f.file_name as name, 
	f.file_path as path, 
	f.file_type as type
	from file f 
	where file_id = '${fileId}'`);
}

// 获取热门文章
function getHotArticle(req) {
  const { pageIndex, pageSize, sortId } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  return querySql(`${getArticleSql(true, sortId)} 
	LIMIT ${firstIndex},${pageSize}`);
}

// 查询到和文章关联的file的信息
function getFileInfoByArticle(articleId) {
  return queryOne(`SELECT
	f.file_id AS id,
	f.file_name AS filename,
	f.file_path AS path 
FROM
	file f
	LEFT JOIN articles a ON a.article_avatar_id = f.file_id
	WHERE a.article_id = '${articleId}'`);
}

// 删除文章，这里同时要删除掉file表中的记录
function deleteArticle(id) {
  // 删除其他表的信息
  querySql(`delete from article_views where article_id = '${id}'`);
  querySql(`delete from article_like where article_id = '${id}'`);
  querySql(`delete from article_comments where article_id = '${id}'`);
  querySql(`delete from set_article_label where article_id = '${id}'`);
  return querySql(`delete from articles where article_id = '${id}'`);
}

module.exports = {
  getOrdinaryList,
  getArticleInfo,
  createOrUpdte,
  updateArticleLabel,
  getArticleFileInfo,
  getHotArticle,
  deleteArticle,
  getFileInfoByArticle
};
