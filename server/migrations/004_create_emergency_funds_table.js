exports.up = function(knex) {
  return knex.schema.createTable('emergency_funds', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.decimal('current_balance', 12, 2).defaultTo(0.00);
    table.string('currency').defaultTo('MYR');
    table.decimal('target_balance', 12, 2);
    table.decimal('monthly_contribution', 10, 2).defaultTo(0.00);
    table.enum('contribution_frequency', ['daily', 'weekly', 'bi_weekly', 'monthly']).defaultTo('monthly');
    table.date('next_contribution_date');
    table.boolean('auto_contribution_enabled').defaultTo(false);
    table.string('payment_method_id'); // Reference to payment method
    table.enum('fund_status', ['active', 'frozen', 'depleted', 'closed']).defaultTo('active');
    table.decimal('total_contributed', 12, 2).defaultTo(0.00);
    table.decimal('total_withdrawn', 12, 2).defaultTo(0.00);
    table.integer('withdrawal_count').defaultTo(0);
    table.date('last_withdrawal_date');
    table.text('withdrawal_purpose');
    table.json('contribution_history');
    table.json('withdrawal_history');
    table.json('fund_recommendations'); // AI-generated recommendations
    table.boolean('is_partner_pool_eligible').defaultTo(false);
    table.decimal('partner_pool_contribution', 12, 2).defaultTo(0.00);
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['business_id']);
    table.index(['fund_status']);
    table.index(['next_contribution_date']);
    table.index(['auto_contribution_enabled']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('emergency_funds');
};