exports.up = function(knex) {
  return knex.schema.createTable('risk_assessments', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.enum('risk_type', [
      'flood', 'supply_chain_disruption', 'health_emergency', 
      'economic_downturn', 'fire', 'theft', 'cybersecurity', 'other'
    ]).notNullable();
    table.enum('severity_level', ['low', 'medium', 'high', 'critical']).notNullable();
    table.decimal('risk_score', 5, 2).notNullable(); // 0.00 to 100.00
    table.decimal('probability', 5, 2).notNullable(); // 0.00 to 100.00
    table.decimal('impact', 5, 2).notNullable(); // 0.00 to 100.00
    table.text('risk_description');
    table.json('risk_factors'); // AI-identified risk factors
    table.json('mitigation_recommendations');
    table.json('vulnerability_assessment');
    table.decimal('estimated_financial_impact', 12, 2);
    table.string('currency').defaultTo('MYR');
    table.integer('cash_runway_days'); // Days business can survive without income
    table.json('historical_data');
    table.json('ai_model_confidence');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('assessment_date').defaultTo(knex.fn.now());
    table.timestamp('next_assessment_date');
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['business_id']);
    table.index(['risk_type']);
    table.index(['severity_level']);
    table.index(['risk_score']);
    table.index(['assessment_date']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('risk_assessments');
};