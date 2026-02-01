/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("files", (table) => {
    table.string("display_name").nullable().defaultTo(null);
  });

  // Backfill existing file rows: strip timestamp prefix from filename
  const files = await knex("files").where({ type: "file" }).whereNull("display_name");
  for (const file of files) {
    const match = file.filename.match(/^\d+-(.+)$/);
    if (match) {
      await knex("files").where({ id: file.id }).update({ display_name: match[1] });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("files", (table) => {
    table.dropColumn("display_name");
  });
};
