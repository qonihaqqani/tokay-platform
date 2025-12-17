/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('emergency_fund_transactions', function(table) {
    table.uuid('receipt_id').nullable().after('description');
    table.foreign('receipt_id').references('id').inTable('receipts').onDelete('SET NULL');
    table.index(['receipt_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('emergency_fund_transactions', function(table) {
    table.dropForeign(['receipt_id']);
    table.dropIndex(['receipt_id']);
    table.dropColumn('receipt_id');
  });
};