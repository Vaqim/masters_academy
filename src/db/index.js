const { Pool } = require('pg');
const { db: dbCOnfig } = require('../config');

const client = new Pool(dbCOnfig);

async function testConnection() {
  try {
    console.log('Hello from pg test connection!');
    await client.query('SELECT NOW()');
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function close() {
  console.log('closing pg wrapper');
  client.end();
}

async function createProduct({ type, color, price, isPair, quantity = 0 }) {
  try {
    if (!type) throw new Error('ERROR: no product type defined');
    if (!color) throw new Error('ERROR: no product color defined');
    if (!price) throw new Error('ERROR: no product price defined');
    if (isPair === null) throw new Error('ERROR: no product isPair option defined');

    const timestamp = new Date();

    const res = await client.query(
      'INSERT INTO products(type, color, price, quantity, created_at, updated_at, deleted_at, ispair) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [type, color, price, quantity, timestamp, timestamp, null, isPair],
    );

    console.log(`DEBUG: new product created: ${JSON.stringify(res.rows[0])}`);
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
  }
}

async function getProduct(id) {
  try {
    if (!id) throw new Error('ERROR: No product id defined');
    const res = await client.query('SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL', [
      id,
    ]);

    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function updateProduct({ id, ...product }) {
  try {
    if (!id) throw new Error('no id');

    const query = [];
    const values = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [i, [k, v]] of Object.entries(product).entries()) {
      query.push(`${k} = $${i + 1}`);
      values.push(v);
    }

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
    return JSON.stringify(res.rows[0]);
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function deleteProduct(id) {
  try {
    if (!id) throw new Error('ERROR: No product id defined');
    // await client.query('DELETE FROM products WHERE id = $1', [id]); // hard delete
    await client.query('UPDATE products SET deleted_at = $1 WHERE id = $2', [new Date(), id]);
    return true;
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function getAllProducts() {
  try {
    const res = await client.query('SELECT * FROM products WHERE deleted_at IS NULL');
    return res.rows;
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

module.exports = {
  testConnection,
  close,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
