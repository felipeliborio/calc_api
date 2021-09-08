import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('operations_log', table => {
    table
    .uuid('id')
    .primary();

    table
    .uuid('user_id')
    .notNullable()
    .index('fk__operations_log__users')
    .references('id')
    .inTable('users')
    .onDelete('set null');

    table
    .string('operation', 511)
    .notNullable();

    table.string('result', 31);

    table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('operations_log');
}
