// Update with your config setting
require("dotenv").config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_LOCAL_USER,
      password: process.env.DB_LOCAL_PASSWORD,
      database: process.env.DB_LOCAL_DBNAME,
      port: process.env.PORT,
    },
  },

  production: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_LOCAL_USER,
      password: process.env.DB_LOCAL_PASSWORD,
      database: process.env.DB_LOCAL_DBNAME,
      port: process.env.PORT,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
