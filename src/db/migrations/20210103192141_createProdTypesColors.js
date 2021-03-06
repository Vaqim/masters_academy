exports.up = async (knex) => {
  await Promise.all([
    knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'),
    knex.schema.raw(`
      CREATE OR REPLACE FUNCTION updated_at_timestamp() RETURNS TRIGGER
        LANGUAGE plpgsql
        AS
        $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$;
    `),
    knex.schema.createTable('colors', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.string('name').unique().notNullable();
      table.timestamp('deleted_at').nullable();
    }),
    knex.schema.createTable('types', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.string('name').unique().notNullable();
      table.timestamp('deleted_at').nullable();
    }),
  ]);

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('color_id').notNullable().references('colors.id');
    table.uuid('type_id').notNullable().references('types.id');
    table.decimal('price').notNullable();
    table.integer('quantity').notNullable().unsigned();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);
    table.unique(['color_id', 'type_id', 'price'], 'uniq_product');
  });

  await knex.schema.raw(`
  CREATE TRIGGER updated_at_timestamp
  BEFORE UPDATE
  ON products
  FOR EACH ROW
  EXECUTE PROCEDURE updated_at_timestamp();
  `);
};

exports.down = async (knex) => {
  await knex.schema.dropTable('products');

  await Promise.all([
    knex.schema.dropTable('types'),
    knex.schema.dropTable('colors'),
    knex.schema.raw('DROP FUNCTION IF EXISTS updated_at_timestamp() CASCADE'),
  ]);

  await knex.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE');
};
