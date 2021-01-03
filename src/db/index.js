/* eslint-disable camelcase */
const Knex = require('knex');

const { db: dbConfig } = require('../config');

const client = Knex(dbConfig);

async function testConnection() {
  try {
    console.log('Hello from pg test connection!');
    await client.raw('SELECT NOW()');
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function getColorId(color) {
  try {
    if (!color) throw new Error('Bad input: color is not defined');

    const res = await client('colors').select('id').where('name', color);

    if (!res) throw new Error('No color in base');

    return res.id;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getTypeId(type) {
  try {
    if (!type) throw new Error('Bad input: type is not defined');

    const res = await client('types').select('id').where('name', type);

    if (!res) throw new Error('No type in base');

    return res.id;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

// function close() {
//   console.log('closing pg wrapper');
//   client.end();
// }

async function createProduct({ type, color, price, quantity = 0 }) {
  try {
    if (!price) throw new Error('ERROR: no product price defined');
    if (!color) throw new Error('ERROR: no product color defined');
    if (!type) throw new Error('ERROR: no product type defined');

    const timestamp = new Date();

    const type_id = client('types').select('id').where('name', type);
    const color_id = client('colors').select('id').where('name', color);

    const insertQuery = client('products').insert({
      type_id,
      color_id,
      price,
      quantity,
      created_at: timestamp,
      updated_at: timestamp,
    });

    const updateQuery = client
      .queryBuilder()
      .update({
        quantity: client.raw('products.quantity + ?', [quantity]),
        updated_at: timestamp,
      })
      .where({
        'products.type_id': type_id,
        'products.color_id': color_id,
        'products.price': price,
      });

    const res = await client.raw(
      `${insertQuery} ON CONFLICT ON CONSTRAINT uniq_product DO ${updateQuery} RETURNING *`,
    );

    console.log(`DEBUG: new product created/updated: ${JSON.stringify(res.rows[0])}`);
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    return false;
  }
}

async function getProduct(id) {
  try {
    if (!id) throw new Error('ERROR: No product id defined');

    const res = await client('products')
      .select({
        id: 'products.id',
        type: 'types.name',
        color: 'colors.name',
        price: 'products.price',
        quantity: 'products.quantity',
      })
      .innerJoin('types', 'products.type_id', 'types.id')
      .innerJoin('colors', 'products.color_id', 'colors.id')
      .where('products.id', id)
      .whereNull('products.deleted_at')
      .returning('*');

    return res[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function updateProduct({ id, ...product }) {
  try {
    if (!id) throw new Error('no id');

    delete product.updated_at;
    delete product.created_at;
    delete product.deleted_at;
    delete product.isPair;

    const query = [];
    const values = [];

    Object.keys(product).forEach((k, i) => {
      if (k === 'color' || k === 'type') {
        query.push(`${k}_id = (SELECT id FROM ${k}s WHERE name = $${i + 1})`);
      } else {
        query.push(`${k} = $${i + 1}`);
      }
      values.push(product[k]);
    });

    if (!values.length) throw new Error('nothing to update');

    values.push(new Date());
    values.push(id);

    const res = await client.query(
      `UPDATE products SET ${query.join(',')}, updated_at = $${values.length - 1} WHERE id = $${
        values.length
      } RETURNING *`,
      values,
    );

    console.log(`DEBUG: Proudct updated ${JSON.stringify(res.rows[0])}`);
    return res.rows[0];
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function deleteProduct(id) {
  try {
    if (!id) throw new Error('ERROR: No product id defined');
    await client('products').where('id', id).update({ deleted_at: new Date() });
    return true;
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function getAllProducts() {
  try {
    const res = client
      .select({
        id: 'products.id',
        type: 'types.name',
        color: 'colors.name',
        price: 'products.price',
        quantity: 'products.quantity',
      })
      .from('products')
      .innerJoin('types', 'products.type_id', 'types.id')
      .innerJoin('colors', 'products.color_id', 'colors.id')
      .returning('*');
    return res;
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

// colors

async function createColor(color) {
  try {
    if (!color) throw new Error('Bad input: color is not defined');

    const res = await client('colors').insert({ name: color }).returning('*');

    console.log(`DEBUG: color ${color} has been created`);
    return res[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getColorById(id) {
  try {
    if (!id) throw new Error('Bad input: color id is not defined');

    const res = await client('colors').select('*').where('id', id).whereNull('deleted_at');

    return res[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function updateColor(id, color) {
  try {
    if (!id) throw new Error('Bad input: color id is not defined');
    if (!color) throw new Error('Nothing to update');

    const res = await client('colors').update('name', color, '*').where('id', id);

    // const res = await client.query(
    //   'UPDATE colors SET name = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
    //   [color, id],
    // );

    return res[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function deleteColor(id) {
  try {
    if (!id) throw new Error('Bad input: color id is not defined');

    // await client('colors').where('id', id).del();
    await client('colors').update('deleted_at', new Date()).where('id', id);

    return true;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

// types

async function createType(type) {
  try {
    if (!type) throw new Error('Bad input: type is not defined');

    const res = await client('types').insert({ name: type }).returning('*');

    console.log(`DEBUG: type ${type} has been created`);
    return res[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getTypeById(id) {
  try {
    if (!id) throw new Error('Bad input: type id is not defined');

    const res = await client('types').select('*').where('id', id).whereNull('deleted_at');

    return res[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function updateType(id, type) {
  try {
    if (!id) throw new Error('Bad input: type id is not defined');
    if (!type) throw new Error('Nothing to update');

    const res = await client('types').update('name', type, '*').where('id', id);

    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function deleteType(id) {
  try {
    if (!id) throw new Error('Bad input: type id is not defined');

    // await client('types').where('id', id).del();
    await client('types').update('deleted_at', new Date()).where('id', id);

    return true;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

module.exports = {
  testConnection,
  // close,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  createColor,
  getColorId,
  getColorById,
  updateColor,
  deleteColor,
  createType,
  getTypeId,
  getTypeById,
  updateType,
  deleteType,
};
