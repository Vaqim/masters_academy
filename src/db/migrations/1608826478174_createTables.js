/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addExtension('uuid-ossp', {
    ifNotExist: true,
  });

  pgm.createTable('colors', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
  });

  pgm.createTable('types', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
  });

  pgm.createTable('products', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    type_id: {
      type: 'uuid',
      references: 'types',
      notNull: true,
    },
    color_id: {
      type: 'uuid',
      references: 'colors',
      notNull: true,
    },
    price: {
      type: 'numeric(2)',
      notNull: true,
    },
    quantity: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
    },
    deleted_at: {
      type: 'timestamptz',
    },
  });

  pgm.addConstraint('products', 'uniq_product', { unique: ['type_id', 'color_id', 'price'] });
};

exports.down = (pgm) => {
  pgm.dropConstraint('products', 'uniq_product', { ifExists: true, cascade: true });

  pgm.dropTable('products', { cascade: true });
  pgm.dropTable('types');
  pgm.dropTable('colors');

  pgm.dropExtension('uuid-ossp', {
    ifExist: true,
  });
};
