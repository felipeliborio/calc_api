import { Knex } from 'knex';

const development: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: "./dev_calc_db.sqlite3"
  },
  migrations: {
    tableName: "calc_migrations"
  },
  useNullAsDefault: true
};

const staging: Knex.Config = {
  client: "mysql",
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: "calc_migrations"
  }
};

const production: Knex.Config = {
  client: "mysql",
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: "calc_migrations"
  }
};

export { development, staging, production };
