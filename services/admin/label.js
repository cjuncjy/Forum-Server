const { querySql, queryOne } = require("../../db/index");

function getLabelList(req) {
  const { pageSize, pageIndex, name, sortId } = req.query;
  const startIndex = (pageIndex - 1) * pageSize;
  return querySql(`SELECT
	l.label_id AS id,
	l.label_name,
	l.label_description AS description,
	s.sort_id AS sort_id,
	s.sort_name 
FROM
	labels l
	JOIN sorts s ON l.sort_id = s.sort_id
  ${name ? "" : "#"} WHERE l.label_name LIKE '%${name}%' 
  ${sortId ? "" : "#"} AND s.sort_id = ${sortId}
	LIMIT ${startIndex},${pageSize}`);
}

function getLabelInfo(id) {
  return queryOne(`select * from labels where label_id = '${id}'`);
}

function createOrUpdate(req) {
  const { id, name, sortId, description } = req.body;
  if (id) {
    // 更新
    return querySql(`UPDATE labels
    SET label_name='${name}',
    label_description='${description}',
    sort_id = '${sortId}'
    WHERE label_id='${id}'`);
  } else {
    // 插入
    return querySql(`INSERT INTO labels 
    (label_name,label_description,sort_id)
    VALUES 
    ('${name}','${description}','${sortId}')`);
  }
}

function deleteLabel(id) {
  return querySql(`delete from labels where label_id='${id}'`);
}

function getLabelsBySortId(sort_id) {
  return querySql(
    `select label_name as name, label_id as id from labels where sort_id = '${sort_id}'`,
  );
}

module.exports = {
  getLabelList,
  getLabelInfo,
  createOrUpdate,
  deleteLabel,
  getLabelsBySortId,
};
