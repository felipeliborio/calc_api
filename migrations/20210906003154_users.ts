import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', table => {
    table
    .uuid('id')
    .primary();

    table
    .string('username', 320)
    .notNullable()
    .unique();

    table
    .specificType('password', 'char(32)')
    .notNullable();

    table
    .enum('type', ['admin', 'user'])
    .defaultTo('user')
    .notNullable();

    table.timestamps(true, true);
  });

  await knex.insert({
    id: '0',
    username: 'admin',
    password: 'admin',
    type: 'admin'
  }).into('users');
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}

