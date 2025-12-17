exports.up = function(knex) {
  return knex.schema
    .createTable('emergency_fund_transactions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('fund_id').notNullable();
      table.decimal('amount', 12, 2).notNullable();
      table.enum('transaction_type', ['contribution', 'withdrawal', 'refund']).notNullable();
      table.enum('payment_method', ['fpx', 'tng', 'grabpay', 'credit_card', 'bank_transfer', 'emergency_release']).notNullable();
      table.enum('status', ['pending', 'completed', 'failed', 'cancelled']).defaultTo('pending');
      table.text('notes');
      table.string('transaction_reference').unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.foreign('fund_id').references('id').inTable('emergency_funds').onDelete('CASCADE');
      table.index(['fund_id', 'created_at']);
      table.index(['status']);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('emergency_fund_transactions');
};