exports.up = async (knex) => {
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.raw(`
  CREATE OR REPLACE FUNCTION created_at_timastamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
      NEW.created_at = CURRENT_TIMESTAMP;
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$;
  `);

  await knex.schema.raw(`
  CREATE OR REPLACE FUNCTION updated_at_timastamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$;
  `);

  await knex.schema.createTable('colors', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('name').unique().notNullable();
    table.timestamp('deleted_at').nullable();
  });

  await knex.schema.createTable('types', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('name').unique().notNullable();
    table.timestamp('deleted_at').nullable();
  });

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('color_id').notNullable().references('colors.id');
    table.uuid('type_id').notNullable().references('types.id');
    table.decimal('price').notNullable();
    table.integer('quantity').notNullable().unsigned();
    table.timestamp('deleted_at').nullable();
    table.timestamps();
  });

  await knex.schema.raw(
    'ALTER TABLE products ADD CONSTRAINT uniq_product UNIQUE(color_id, type_id, price)',
  );

  await knex.schema.raw(`
  CREATE TRIGGER created_at_timastamp
  BEFORE INSERT
  ON products
  FOR EACH ROW
  EXECUTE PROCEDURE created_at_timastamp();
  `);

  await knex.schema.raw(`
  CREATE TRIGGER updated_at_timastamp
  BEFORE UPDATE
  ON products
  FOR EACH ROW
  EXECUTE PROCEDURE updated_at_timastamp();
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw('ALTER TABLE products DROP CONSTRAINT uniq_product');
  await knex.schema.dropTable('products');
  await knex.schema.dropTable('types');
  await knex.schema.dropTable('colors');
  await knex.schema.raw('DROP FUNCTION IF EXISTS created_at_timastamp() CASCADE');
  await knex.schema.raw('DROP FUNCTION IF EXISTS updated_at_timastamp() CASCADE');
  await knex.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE');
};
