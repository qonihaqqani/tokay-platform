exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('phone_number').unique().notNullable();
    table.string('email').unique();
    table.string('full_name');
    table.string('password_hash');
    table.string('verification_code');
    table.boolean('is_phone_verified').defaultTo(false);
    table.boolean('is_email_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.enum('preferred_language', ['en', 'ms', 'zh', 'ta']).defaultTo('ms');
    table.enum('role', ['user', 'business_owner', 'admin']).defaultTo('business_owner');
    table.json('profile_settings');
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['phone_number']);
    table.index(['email']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};