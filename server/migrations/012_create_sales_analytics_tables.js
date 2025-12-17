/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Enhanced invoice line items table for detailed tracking
  return knex.schema.createTable('invoice_line_items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').notNullable().references('id').inTable('invoices').onDelete('CASCADE');
    table.string('product_code').notNullable(); // Product SKU or code
    table.string('product_name').notNullable();
    table.text('product_description');
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('line_total', 10, 2).notNullable();
    table.string('category').nullable(); // Product category (e.g., 'premium', 'economy', 'combo')
    table.string('supplier').nullable(); // Supplier for this product
    table.decimal('cost_price', 10, 2).nullable(); // For profit margin calculation
    table.json('metadata').nullable(); // Additional product attributes
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['invoice_id']);
    table.index(['product_code']);
    table.index(['category']);
    table.index(['created_at']);
  })
  .then(() => {
    // Sales analytics summary table (pre-calculated for performance)
    return knex.schema.createTable('sales_analytics_daily', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
      table.date('sales_date').notNullable();
      table.integer('total_transactions').notNullable().defaultTo(0);
      table.integer('total_items_sold').notNullable().defaultTo(0);
      table.decimal('total_revenue', 12, 2).notNullable().defaultTo(0);
      table.decimal('total_profit', 12, 2).nullable();
      table.decimal('average_transaction_value', 10, 2).defaultTo(0);
      table.decimal('average_item_price', 10, 2).defaultTo(0);
      table.integer('high_value_transactions').defaultTo(0); // Transactions > average
      table.integer('low_value_high_volume_transactions').defaultTo(0); // Low price but high quantity
      table.json('category_breakdown').nullable(); // { "premium": {"revenue": 5000, "quantity": 50}, "economy": {...} }
      table.json('top_products').nullable(); // Top 5 products by revenue
      table.json('peak_hours').nullable(); // Sales by hour
      table.timestamps(true, true);
      
      // Unique constraint
      table.unique(['business_id', 'sales_date']);
      table.index(['business_id', 'sales_date']);
    });
  })
  .then(() => {
    // Customer behavior patterns table
    return knex.schema.createTable('customer_behavior_patterns', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
      table.string('customer_identifier').notNullable(); // Phone number or customer ID
      table.date('analysis_date').notNullable();
      table.integer('total_visits').defaultTo(0);
      table.decimal('total_spent', 10, 2).defaultTo(0);
      table.decimal('average_transaction_value', 10, 2).defaultTo(0);
      table.string('customer_type').nullable(); // 'high_value', 'frequent', 'bargain_hunter', 'new'
      table.json('preferred_categories').nullable(); // Categories they buy most
      table.json('purchase_patterns').nullable(); // Time of day, day of week patterns
      table.boolean('is_combo_candidate').defaultTo(false); // AI-identified for combo deals
      table.timestamps(true, true);
      
      table.index(['business_id', 'customer_identifier']);
      table.index(['customer_type']);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('customer_behavior_patterns')
    .then(() => knex.schema.dropTableIfExists('sales_analytics_daily'))
    .then(() => knex.schema.dropTableIfExists('invoice_line_items'));
};
