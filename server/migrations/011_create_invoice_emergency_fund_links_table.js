/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('invoice_emergency_fund_links', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').notNullable();
    table.uuid('emergency_fund_id').notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.text('purpose');
    table.enum('status', ['pending', 'approved', 'rejected', 'processed']).defaultTo('pending');
    table.text('notes');
    table.uuid('approved_by');
    table.timestamp('approved_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');
    table.foreign('emergency_fund_id').references('id').inTable('emergency_funds').onDelete('CASCADE');
    table.foreign('approved_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['invoice_id']);
    table.index(['emergency_fund_id']);
    table.index(['status']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('invoice_emergency_fund_links');
};