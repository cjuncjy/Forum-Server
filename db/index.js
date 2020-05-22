const mysql = require("mysql");
const config = require("./config");
const { debug } = require("../utils/constant");
function connect() {
  return mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true
  });
}

function querySql(sql) {
  const conn = connect();
  debug && console.log(sql);
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, results) => {
        if (err) {
          debug && console.log("查询失败，结果是： ", JSON.stringify(err));
          reject(err);
        } else {
          debug && console.log("查询成功，结果是: ", JSON.stringify(results));
          resolve(results);
        }
      });
    } catch (e) {
      reject(e);
    } finally {
      conn.end();
    }
  });
}

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0]);
        } else {
          resolve(null);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 计算当前表的总数
 *
 */
function querySum(table_name, addtion) {
  return querySql(`select count(*) as 'count' from ${table_name} ${addtion}`);
}

module.exports = {
  querySql,
  queryOne,
  querySum
};
