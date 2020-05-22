const { querySql } = require("../../db/index");

function getRandom5Articles() {
  return querySql(`SELECT
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
GROUP BY
	a.article_id 
ORDER BY
	RAND() 
	LIMIT 5`);
}

module.exports = {
  getRandom5Articles
};
