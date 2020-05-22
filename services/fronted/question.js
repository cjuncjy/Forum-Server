const { querySql, queryOne } = require("../../db/index");
const moment = require("moment");
const { decoded } = require("../../utils/index");

async function getSortLabelTree() {
  const sorts = await querySql(
    `SELECT sort_id AS sortId, sort_name AS sortName FROM sorts`
  );
  const labels = await querySql(
    `SELECT label_id AS labelId, label_name AS labelName, sort_id as pid FROM labels`
  );

  sorts.forEach(sort => {
    sort.children = [];
    labels.forEach(label => {
      if (label.pid === sort.sortId) {
        sort.children.push(label);
      }
    });
  });
  return sorts;
}

// 创建或者更新问题
async function createOrUpdateQuest(req) {
  let { id, title, content, labelIds, userId } = req.body;
  content = await content.replace(/"/g, "'"); // 把内容中双引号变成单引号
  labelIds = labelIds.join(",");
  const createAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  if (id) {
    // 修改
    const updateAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    // 先修改中间表
    querySql(
      `update set_question_label set label_id = '${labelIds}' where question_id = '${id}'`
    );
    // 然后更新问题表
    return querySql(
      `update questions set question_title = \"${title}\", question_content = \"${content}\", updateAt = \"${updateAt}\" where id = \"${id}\"`
    );
  } else {
    // 新增

    const result = await querySql(
      `insert into questions (question_title, question_content, createAt, updateAt, user_id) values (\"${title}\", \"${content}\",\"${createAt}\", \"${createAt}\", \"${userId}\")`
    );
    let insertId = result.insertId;
    querySql(
      `insert into set_question_label (question_id, label_id) values ('${insertId}', '${labelIds}')`
    );
    return { insertId };
  }
}

// 问题详情页
async function questDetails(req) {
  const { id } = req.query;
  // 获取基本信息
  const baseinfo = await queryOne(`SELECT
	qs.id AS id,
	qs.question_title AS title,
	qs.question_content AS content,
	qs.createAt AS createAt,
  qs.updateAt AS updateAt,
  qs.comment_adopted_id AS adoptedId,
	u.user_name AS username,
	qs.user_id AS userId,
	COUNT(qv.id) as views
FROM
	questions qs
	LEFT JOIN users u ON u.user_id = qs.user_id 
	LEFT JOIN question_views qv ON qv.question_id = qs.id 
WHERE
  qs.id = '${id}'`);
  // 获取标签列表
  const labels = await querySql(
    `SELECT label_id AS labelId, label_name AS labelName FROM labels WHERE FIND_IN_SET( label_id,( SELECT label_id FROM set_question_label ql WHERE question_id = '${id}' ))`
  );
  baseinfo.labels = labels;
  return baseinfo;
}

// 评论问题
async function commentQuest(req) {
  let { fromUserId, toUserId, questionId, content } = req.body;
  content = await content.replace(/"/g, "'"); // 把内容中双引号变成单引号
  const createAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  if (!toUserId) {
    toUserId = 0;
  }
  return querySql(
    `INSERT INTO question_comments (from_user_id, question_id, comment_content,createAt, to_user_id) VALUES (\"${fromUserId}\",\"${questionId}\",\"${content}\",\"${createAt}\", \"${toUserId}\")`
  );
}

// 获取评论列表
function getCommentList(req) {
  const { id } = req.query;
  return querySql(`SELECT
	qc.comment_id AS id,
	qc.from_user_id AS fromUserId,
	u1.user_name AS fromUserName,
	u2.user_name AS toUserName,
	qc.to_user_id AS toUserId,
	qc.question_id AS questionId,
	qc.comment_content AS content,
	qc.createAt AS createAt 
FROM
  question_comments qc
	LEFT JOIN users u1 ON u1.user_id = qc.from_user_id
	LEFT JOIN users u2 ON u2.user_id = qc.to_user_id 
WHERE
	qc.question_id = '${id}'`);
}

// 更新阅读数
async function updateViewCount(req) {
  const { userId } = req.body;
  const { id } = req.query;
  const result = await queryOne(
    `SELECT id from question_views where user_id = '${userId}' and question_id = '${id}'`
  );
  // 如果不存在记录就插入新的
  if (!result) {
    await querySql(
      `insert into question_views (user_id, question_id) values ('${userId}', '${id}')`
    );
  }
}

// 点赞
async function likeQuest(req) {
  // 查看是否点过赞
  const { id, userId } = req.body;
  const isLiked = await querySql(
    `select id from question_like where user_id = '${userId}' and question_id = '${id}'`
  );
  if (isLiked.length === 0) {
    // 没点赞过
    return querySql(
      `insert into question_like (user_id, question_id) values ('${userId}', '${id}')`
    );
  } else {
    // 点过了
    return querySql(
      `delete from question_like where user_id = '${userId}' and question_id = '${id}'`
    );
  }
}

// 获取是否已经点赞和赞的数量
async function getIsLikedAndCount(req) {
  const { userId } = req.body;
  const { id } = req.query;
  const res = await queryOne(
    `select id from question_like where user_id = '${userId}' and question_id = '${id}'`
  );
  const count = await queryOne(
    `select count(id) as count from question_like where question_id = '${id}'`
  );
  return { isLiked: !!res, count: count.count };
}

// 获取分页问题列表
async function getQuestList(req, labelId, myList) {
  labelId = parseInt(labelId);
  const { pageIndex, pageSize } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  if (myList) {
    const decode = decoded(req);
    if (decode && decode.id) {
      req.body.userId = decode.id;
    }
  }
  let total = await queryOne(`SELECT
	count(q.id) as count
FROM
	questions q,
  set_question_label ql
  where ql.question_id = q.id 
  ${labelId ? " and ql.label_id like '%" + labelId + ",%'" : ""}
  ${myList ? " and q.user_id ='" + req.body.userId + "'" : ""}
  `);

  let res = await querySql(`SELECT
	q.id AS id,
	q.user_id AS userId,
	u.user_name as username,
	q.question_title as title,
  q.createAt as createAt,
  q.comment_adopted_id as adoptedId,
	COUNT(qc.question_id) as commentCount,
  (SELECT COUNT(qv.question_id) from question_views qv where qv.question_id = q.id) as viewsCount,
  ql.label_id as labelIds
FROM
	questions q
	left JOIN users u ON u.user_id = q.user_id 
  left join question_comments qc on qc.question_id = q.id
  LEFT JOIN set_question_label ql on ql.question_id = q.id
  ${labelId ? "WHERE ql.label_id like '%" + labelId + ",%'" : ""}
  ${myList ? " WHERE q.user_id ='" + req.body.userId + "'" : ""}
	GROUP BY q.id
	ORDER BY q.createAt DESC
  LIMIT ${firstIndex}, ${pageSize}`);
  let obj = await someDataDetails(res, total, labelId);
  res = obj.res;
  total = obj.total;
  return { list: res, totalCount: total.count };
}

async function someDataDetails(res, total, labelId) {
  // 处理like匹配异常的问题
  for (let i = 0; i < res.length; i++) {
    let curRes = res[i];
    curRes.labelIds = curRes.labelIds.split(",").map(_ => parseInt(_));
    if (labelId) {
      // 匹配出来的假数据 比如12中包含2，但是不属于2
      if (!curRes.labelIds.includes(labelId)) {
        res.splice(i, 1);
        i--;
        total.count--;
      }
    }
  }
  const allLabel = await querySql(
    `select label_id as id, label_name as name from labels`
  );
  // 处理出labelNames
  res.forEach(item => {
    item.labelNames = [];
    // item.labelIds = item.labelIds.split(",").map(_ => parseInt(_));
    item.labelIds.forEach(id => {
      const labelItem = allLabel.find(label => label.id === id);
      // console.log(name);
      let name = labelItem && labelItem.name;
      item.labelNames.push(name);
    });
  });
  return { res, total };
  // console.log(res);
}

async function getMyLikedQuestList(req) {
  const { pageIndex, pageSize } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;

  const decode = decoded(req);
  if (decode && decode.id) {
    req.body.userId = decode.id;
  }

  let res = await querySql(`SELECT
	q.id AS id,
	q.user_id AS userId,
	u.user_name as username,
	q.question_title as title,
  q.createAt as createAt,
  q.comment_adopted_id as adoptedId,
	COUNT(qc.question_id) as commentCount,
  (SELECT COUNT(qv.question_id) from question_views qv where qv.question_id = q.id) as viewsCount,
  ql.label_id as labelIds
FROM
	questions q
	left JOIN users u ON u.user_id = q.user_id 
  left join question_comments qc on qc.question_id = q.id
  LEFT JOIN set_question_label ql on ql.question_id = q.id
	LEFT JOIN question_like qlike on q.id = qlike.question_id
	WHERE qlike.user_id = '${req.body.userId}'
	GROUP BY q.id
  ORDER BY q.createAt DESC  
  LIMIT ${firstIndex}, ${pageSize}`);

  let total = await queryOne(`SELECT
	count(q.id) as count
FROM
	question_like q
  where q.user_id = '${req.body.userId}'`);

  someDataDetails(res, total);
  return { list: res, totalCount: total.count };
}

// 采纳评论
function adoptedComment(commentId, questionId) {
  return querySql(
    `update questions set comment_adopted_id = '${commentId}' where id = '${questionId}'`
  );
}

module.exports = {
  getSortLabelTree,
  createOrUpdateQuest,
  questDetails,
  commentQuest,
  getCommentList,
  updateViewCount,
  likeQuest,
  getIsLikedAndCount,
  getQuestList,
  adoptedComment,
  getMyLikedQuestList
};
