const { querySql, queryOne } = require("../../db/index");

function getSortList(req) {
  const { pageIndex, pageSize, sortName } = req.query;
  const firstIndex = (pageIndex - 1) * pageSize;
  return querySql(
    `select sort_id as id,sort_name as name, sort_description as description from sorts where sort_name like '%${sortName}%' limit ${firstIndex}, ${pageSize}`
  );
}

function getSortInfoById(id) {
  return queryOne(`select * from sorts where sort_id = '${id}'`);
}

function createOrUpdate(req) {
  const { id, name, description } = req.body;
  if (id) {
    // 修改
    return querySql(`UPDATE sorts
    SET sort_name='${name}',
    sort_description='${description}'
    WHERE sort_id='${id}'`);
  } else {
    // 插入
    return querySql(`INSERT INTO sorts 
    (sort_name,sort_description)
    VALUES 
    ('${name}','${description}')`);
  }
}

function deleteSort(id) {
  return querySql(`delete from sorts where sort_id='${id}'`);
}

function getSortAll() {
  return querySql(`select sort_id as id, sort_name as name from sorts`);
}

module.exports = {
  getSortList,
  createOrUpdate,
  getSortInfoById,
  deleteSort,
  getSortAll
};
