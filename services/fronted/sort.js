const { querySql, queryOne } = require("../../db/index");
function getSortAndNum() {
  return querySql(`SELECT
	s.sort_id AS id,
	s.sort_name AS sort_name,
	( SELECT count( a.sort_id ) FROM articles a WHERE a.sort_id = s.sort_id GROUP BY s.sort_id )  AS count
FROM
	sorts s`);
}
module.exports = {
  getSortAndNum
};
