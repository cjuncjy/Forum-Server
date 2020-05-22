const { querySql } = require("../../db/index");

function getAllLabels() {
  return querySql(`SELECT
	label_id AS id,
	label_name AS 'name' 
FROM
	labels`);
}

module.exports = {
  getAllLabels
};
