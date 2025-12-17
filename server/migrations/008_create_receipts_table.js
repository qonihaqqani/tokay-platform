/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('receipts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.uuid('business_id').notNullable();
    table.string('image_filename').notNullable();
    table.string('image_path').notNullable();
    table.string('original_filename').notNullable();
    table.string('mime_type').notNullable();
    table.integer('file_size').notNullable();
    
    // Extracted data from OCR
    table.string('merchant_name');
    table.decimal('total_amount', 10, 2);
    table.date('receipt_date');
    table.time('receipt_time');
    table.string('category');
    table.json('extracted_items');
    table.decimal('tax_amount', 10, 2);
    table.string('tax_type');
    table.string('payment_method');
    table.string('business_registration_number');
    
    // Processing metadata
    table.decimal('confidence_score', 3, 2);
    table.string('processing_status').defaultTo('pending');
    table.json('processing_errors');
    table.text('raw_ocr_text');
    table.json('analysis_data'); // Store receipt analysis results
    
    // User confirmation
    table.boolean('user_confirmed').defaultTo(false);
    table.json('user_corrections');
    table.text('notes');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    
    // Indexes
    table.index(['user_id', 'created_at']);
    table.index(['business_id', 'created_at']);
    table.index(['processing_status']);
    table.index(['receipt_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('receipts');
};