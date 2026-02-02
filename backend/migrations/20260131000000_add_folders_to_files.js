/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("files", (table) => {
    table
      .integer("parent_id")
      .unsigned()
      .nullable()
      .defaultTo(null)
      .references("id")
      .inTable("files")
      .onDelete("CASCADE");
    table.string("type").notNullable().defaultTo("file");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("files", (table) => {
    table.dropForeign("parent_id");
    table.dropColumn("parent_id");
    table.dropColumn("type");
  });
};
