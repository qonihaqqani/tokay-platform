exports.up = function(knex) {
  return knex.schema
    .createTable('emergency_fund_withdrawals', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('fund_id').notNullable();
      table.decimal('amount', 12, 2).notNullable();
      table.text('reason').notNullable();
      table.enum('status', ['pending', 'approved', 'rejected', 'processed', 'cancelled']).defaultTo('pending');
      table.text('admin_notes');
      table.uuid('approved_by');
      table.timestamp('approved_at');
      table.timestamp('requested_at').defaultTo(knex.fn.now());
      table.timestamp('processed_at');
      table.string('withdrawal_reference').unique();
      table.text('supporting_documents'); // JSON array of document URLs
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.foreign('fund_id').references('id').inTable('emergency_funds').onDelete('CASCADE');
      table.foreign('approved_by').references('id').inTable('users').onDelete('SET NULL');
      table.index(['fund_id', 'status']);
      table.index(['requested_at']);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('emergency_fund_withdrawals');
};