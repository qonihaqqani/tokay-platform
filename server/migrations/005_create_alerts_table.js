exports.up = function(knex) {
  return knex.schema.createTable('alerts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.enum('alert_type', [
      'weather_warning', 'flood_alert', 'supply_chain_disruption', 
      'health_emergency', 'economic_alert', 'security_threat', 'system_maintenance'
    ]).notNullable();
    table.enum('severity_level', ['info', 'warning', 'critical', 'emergency']).notNullable();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.json('location_data'); // Geofencing data for location-specific alerts
    table.string('source'); // MET Malaysia, DID, etc.
    table.string('external_alert_id'); // Reference to external alert system
    table.timestamp('alert_timestamp').defaultTo(knex.fn.now());
    table.timestamp('expires_at');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.json('action_recommendations');
    table.json('affected_areas');
    table.enum('delivery_channels', ['push', 'sms', 'email', 'in_app']);
    table.boolean('sms_sent').defaultTo(false);
    table.boolean('email_sent').defaultTo(false);
    table.boolean('push_sent').defaultTo(false);
    table.timestamp('sms_sent_at');
    table.timestamp('email_sent_at');
    table.timestamp('push_sent_at');
    table.json('delivery_logs');
    table.text('user_response');
    table.timestamp('response_timestamp');
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['business_id']);
    table.index(['alert_type']);
    table.index(['severity_level']);
    table.index(['is_active']);
    table.index(['is_read']);
    table.index(['alert_timestamp']);
    table.index(['expires_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('alerts');
};