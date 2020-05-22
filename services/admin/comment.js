const { querySql, queryOne } = require("../../db/index");
const moment = require("moment");

// 获取文章评论列表
async function getArticleComment(req) {
  const { pageIndex, pageSize } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  const totalCount = await queryOne(`select COUNT(ac.comment_id) as count FROM
	article_comments ac`);

  let result = await querySql(`SELECT
	ac.comment_id as id,
	ac.from_user_id as fromUserId,
	ac.to_user_id as toUserId,
	ac.article_id as articleId,
	a.article_title as articleTitle,
	u1.user_name as fromUserName,
	u2.user_name as toUserName,
	ac.comment_content as content,
	ac.comment_createAt as createAt
FROM
	article_comments ac
	LEFT JOIN users u1 ON u1.user_id = ac.from_user_id
	LEFT JOIN users u2 ON u2.user_id = ac.to_user_id
	LEFT JOIN articles a ON a.article_id = ac.article_id
  LIMIT ${firstIndex},${pageSize}`);
  return { list: result, totalCount: totalCount.count };
}

// 获取问答评论列表
async function getQuestComment(req) {
  const { pageIndex, pageSize } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  const totalCount = await queryOne(`select COUNT(qc.comment_id) as count FROM
  question_comments qc`);

  let result = await querySql(`SELECT
	 qc.comment_id as id,
	 qc.from_user_id as fromUserId,
	 qc.to_user_id as toUserId,
	 qc.question_id as questionId,
	q.question_title as questionTitle,
	u1.user_name as fromUserName,
	u2.user_name as toUserName,
	 qc.comment_content as content,
	 qc.createAt as createAt
FROM
	question_comments qc
	LEFT JOIN users u1 ON u1.user_id =  qc.from_user_id
	LEFT JOIN users u2 ON u2.user_id =  qc.to_user_id
	LEFT JOIN questions q ON q.id =  qc.question_id
  LIMIT ${firstIndex},${pageSize}`);
  return { list: result, totalCount: totalCount.count };
}

// 获取详情
function getDetails(commentId, isQuest) {
  return queryOne(`SELECT 
   comment_id as id,
	 from_user_id as fromUserId,
   to_user_id as toUserId,
   ${
     isQuest === "false"
       ? "article_id as articleId,"
       : "question_id as questionId,"
   }
	 comment_content as content,
   ${
     isQuest === "false"
       ? "comment_createAt as createAt"
       : "createAt as createAt"
   }
   from ${isQuest === "false" ? "article_comments" : "question_comments"}
   where comment_id = '${commentId}'`);
}

function createOrUpdate(form, isQuest) {
  let { id, content, fromUserId, toUserId, articleId, questionId } = form;
  toUserId = toUserId || 0;
  if (id) {
    // 更新
    return querySql(
      `update 
      ${isQuest === "false" ? "article_comments" : "question_comments"}
      set from_user_id='${fromUserId}',to_user_id='${toUserId}',
      ${isQuest === "false" ? "article_id" : "question_id"}='${
        isQuest === "false" ? articleId : questionId
      }',
      comment_content='${content}' where comment_id = '${id}'`
    );
  } else {
    // 创建
    const createAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    return querySql(
      `insert into 
      ${isQuest === "false" ? "article_comments" : "question_comments"} 
      (from_user_id, to_user_id,
        ${isQuest === "false" ? "article_id" : "question_id"}, 
        comment_content, 
        ${isQuest === "false" ? "comment_createAt" : "createAt"} 
      ) values ('${fromUserId}','${toUserId}','${
        isQuest === "false" ? articleId : questionId
      }','${content}', '${createAt}')`
    );
  }
}

function deleteComment(commentId, isQuest) {
  return querySql(
    `delete from 
    ${isQuest === "false" ? "article_comments" : "question_comments"} 
    where comment_id = '${commentId}'`
  );
}

module.exports = {
  getArticleComment,
  getDetails,
  createOrUpdate,
  deleteComment,
  getQuestComment
};
