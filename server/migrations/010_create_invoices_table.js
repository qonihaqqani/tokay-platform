/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('invoices', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.uuid('business_id').notNullable();
    
    // Invoice details
    table.string('invoice_number').unique().notNullable();
    table.string('invoice_type').defaultTo('standard'); // standard, proforma, credit_note, debit_note
    table.enum('status', ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'void']).defaultTo('draft');
    table.date('invoice_date').notNullable();
    table.date('due_date').notNullable();
    table.date('paid_date');
    
    // Customer details
    table.string('customer_name').notNullable();
    table.string('customer_email');
    table.string('customer_phone');
    table.string('customer_registration_number');
    table.text('customer_address');
    table.string('customer_state');
    table.string('customer_postal_code');
    table.string('customer_country').defaultTo('Malaysia');
    
    // Financial details
    table.decimal('subtotal', 12, 2).notNullable();
    table.decimal('tax_amount', 12, 2).defaultTo(0.00);
    table.decimal('discount_amount', 12, 2).defaultTo(0.00);
    table.decimal('total_amount', 12, 2).notNullable();
    table.decimal('paid_amount', 12, 2).defaultTo(0.00);
    table.decimal('balance_due', 12, 2).notNullable();
    table.string('currency').defaultTo('MYR');
    
    // Tax details (Malaysia specific)
    table.string('tax_type'); // SST, GST, exempt
    table.decimal('tax_rate', 5, 2); // e.g., 6.00 for 6% SST
    table.boolean('tax_exempt').defaultTo(false);
    table.string('tax_exemption_reason');
    
    // LHDN e-invoicing compliance
    table.string('lhdn_document_type'); // INVOICE, CREDIT_NOTE, DEBIT_NOTE
    table.string('lhdn_unique_identifier'); // UUID from LHDN system
    table.string('lhdn_submission_id');
    table.enum('lhdn_status', ['pending', 'submitted', 'accepted', 'rejected', 'error']).defaultTo('pending');
    table.json('lhdn_response');
    table.timestamp('lhdn_submitted_at');
    table.string('lhdn_validation_hash'); // For integrity verification
    
    // Payment details
    table.json('payment_terms');
    table.string('payment_method'); // bank_transfer, cash, credit_card, online_payment
    table.json('payment_instructions');
    table.string('payment_reference');
    
    // Resilience integration
    table.boolean('is_emergency_related').defaultTo(false);
    table.text('emergency_notes');
    table.uuid('emergency_fund_transaction_id'); // Link to emergency fund if paid from it
    
    // Metadata
    table.json('line_items'); // Array of invoice line items
    table.json('notes');
    table.json('terms_and_conditions');
    table.json('metadata'); // Additional custom fields
    
    // Automation and reminders
    table.boolean('auto_reminders_enabled').defaultTo(true);
    table.json('reminder_schedule'); // Custom reminder timing
    table.integer('reminder_count').defaultTo(0);
    table.timestamp('last_reminder_sent_at');
    
    // Digital signature and verification
    table.text('digital_signature');
    table.string('signature_algorithm');
    table.timestamp('signed_at');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    
    // Indexes
    table.index(['user_id', 'created_at']);
    table.index(['business_id', 'invoice_date']);
    table.index(['status']);
    table.index(['due_date']);
    table.index(['customer_email']);
    table.index(['lhdn_status']);
    table.index(['invoice_number']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('invoices');
};