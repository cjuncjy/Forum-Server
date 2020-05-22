const { querySql, queryOne } = require("../../db/index");

async function getList(req) {
  const { pageIndex, pageSize, userId } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  const totalCount = await queryOne(`select COUNT(id) as count from questions
  ${userId ? "where user_id = " + userId : ""}`);
  let result = await querySql(
    `select id, q.user_id as userId, u.user_name as username, question_title as title,question_content as content, comment_adopted_id as adoptedId, createAt, updateAt from questions q left join users u on u.user_id = q.user_id 
    ${userId ? "where q.user_id = " + userId : ""}
    limit ${firstIndex}, ${pageSize}`
  );
  return { list: result, totalCount: totalCount.count };
}

async function getInfo(id) {
  let labelIds = await queryOne(
    `select label_id as labelIds from set_question_label where question_id = '${id}'`
  );
  labelIds = labelIds.labelIds.split(",").map(_ => parseInt(_));
  let result = await queryOne(
    `select id,user_id as userId,question_title as title,question_content as content, comment_adopted_id as adoptedId from questions where id = '${id}'`
  );
  result.labelIds = labelIds;
  return result;
}

function deleteQuest(id) {
  // 删除中间表
  querySql(`delete from set_question_label where question_id = '${id}'`);
  // 删除问答中的评论
  querySql(`delete from question_comments where question_id = '${id}'`);
  return querySql(`delete from questions where id = '${id}'`);
}

module.exports = { getList, getInfo, deleteQuest };
