exports.up = function(knex) {
  return knex.schema.createTable('businesses', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('business_name').notNullable();
    table.string('business_registration_number').unique();
    table.enum('business_type', [
      'retail', 'food_beverage', 'services', 'manufacturing', 
      'agriculture', 'transportation', 'construction', 'technology', 'other'
    ]).notNullable();
    table.enum('business_size', ['micro', 'small', 'medium']).defaultTo('micro');
    table.integer('number_of_employees').defaultTo(1);
    table.string('address_line1');
    table.string('address_line2');
    table.string('city');
    table.string('state');
    table.string('postal_code');
    table.string('country').defaultTo('Malaysia');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.string('phone_number');
    table.string('email');
    table.string('website');
    table.enum('monthly_revenue_range', [
      'below_5000', '5000_10000', '10000_25000', '25000_50000', 
      '50000_100000', '100000_250000', 'above_250000'
    ]);
    table.text('business_description');
    table.json('operating_hours');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('verified_at');
    table.json('verification_documents');
    table.json('business_metadata');
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['user_id']);
    table.index(['business_type']);
    table.index(['state']);
    table.index(['postal_code']);
    table.index(['is_active']);
    table.index(['is_verified']);
    
    // Geospatial index for location-based queries
    table.index(['latitude', 'longitude']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('businesses');
};