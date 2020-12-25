const { Pool } = require('pg');
const { db: dbConfig } = require('../config');

const client = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('Hello from pg test connection!');
    await client.query('SELECT NOW()');
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

async function getColorId(color) {
  try {
    if (!color) throw new Error('Bad input: color is not defined');

    const res = await client.query('SELECT id FROM colors WHERE name = $1', [color]);

    if (!res.rows[0]) throw new Error('No color in base');

    return res.rows[0].id;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getTypeId(type) {
  try {
    if (!type) throw new Error('Bad input: type is not defined');

    const res = await client.query('SELECT id FROM types WHERE name = $1', [type]);

    if (!res.rows[0]) throw new Error('No type in base');

    return res.rows[0].id;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getTypeAndColorIds(color, type) {
  try {
    const res = await client.query(
      'SELECT cls.cid, tps.tid FROM (SELECT colors.id cid, row_number() OVER() FROM colors WHERE name = $1) cls FULL OUTER JOIN (SELECT types.id tid, row_number() OVER() FROM types WHERE name = $2) tps USING(row_number)',
      [color, type],
    );

    return [res.rows[0].cid, res.rows[0].tid];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

function close() {
  console.log('closing pg wrapper');
  client.end();
}

async function createProduct({ type, color, price, quantity = 0 }) {
  try {
    if (!price) throw new Error('ERROR: no product price defined');

    const [colorId, typeId] = await getTypeAndColorIds(color, type);

    if (!colorId) throw new Error('ERROR: no product color defined');
    if (!typeId) throw new Error('ERROR: no product type defined');

    const timestamp = new Date();

    const res = await client.query(
      'INSERT INTO products(type_id, color_id, price, quantity, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5) ON CONFLICT ON CONSTRAINT uniq_product DO UPDATE SET quantity = products.quantity + $4, updated_at = $5 WHERE products.type_id = $1 AND products.color_id = $2 AND products.price = $3 RETURNING *',
      [typeId, colorId, price, quantity, timestamp],
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
    const res = await client.query(
      'SELECT products.id, types.name, colors.name, products.price, products.quantity FROM products INNER JOIN types ON (products.type_id = types.id) INNER JOIN colors ON (products.color_id = colors.id) WHERE products.id = $1 AND deleted_at IS NULL',
      [id],
    );

    return res.rows[0];
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

    switch (true) {
      case Boolean(product.type) && Boolean(product.color):
        [product.color_id, product.type_id] = await getTypeAndColorIds(product.color, product.type);

        delete product.color;
        delete product.type;
        break;
      case Boolean(product.color):
        product.color_id = await getColorId(product.color);

        delete product.color;
        break;
      case Boolean(product.type):
        product.type_id = await getTypeId(product.type);

        delete product.type;
        break;
      default:
        break;
    }

    const query = [];
    const values = [];

    Object.keys(product).forEach((k, i) => {
      query.push(`${k} = $${i + 1}`);
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
    const res = await client.query(
      'SELECT products.id, types.name, colors.name, products.price, products.quantity FROM products INNER JOIN types ON (products.type_id = types.id) INNER JOIN colors ON (products.color_id = colors.id) WHERE deleted_at IS NULL',
    );
    return res.rows;
  } catch (error) {
    console.error(error.message || error);
    throw error;
  }
}

// colors

async function createColor(color) {
  try {
    if (!color) throw new Error('Bad input: color is not defined');

    const res = await client.query('INSERT INTO colors(name) VALUES($1) RETURNING *', [color]);
    console.log(`DEBUG: color ${color} has been created`);
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getColorById(id) {
  try {
    if (!id) throw new Error('Bad input: color id is not defined');
    const res = await client.query('SELECT * FROM colors WHERE id = $1 AND deleted_at IS NULL', [
      id,
    ]);

    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function updateColor(id, color) {
  try {
    if (!id) throw new Error('Bad input: color id is not defined');
    if (!color) throw new Error('Nothing to update');

    const res = await client.query(
      'UPDATE colors SET name = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [color, id],
    );

    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function deleteColor(id) {
  try {
    if (!id) throw new Error('Bad input: color id is not defined');

    // await client.query('DELETE FROM colors WHERE id = $1', [id]);
    await client.query('UPDATE colors SET deleted_at = $1 WHERE id = $2', [new Date(), id]);

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

    const res = await client.query('INSERT INTO types(name) VALUES($1) RETURNING *', [type]);
    console.log(`DEBUG: type ${type} has been created`);
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function getTypeById(id) {
  try {
    if (!id) throw new Error('Bad input: type id is not defined');
    const res = await client.query('SELECT * FROM types WHERE id = $1 AND deleted_at IS NULL', [
      id,
    ]);

    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function updateType(id, type) {
  try {
    if (!id) throw new Error('Bad input: type id is not defined');
    if (!type) throw new Error('Nothing to update');

    const res = await client.query('UPDATE types SET name = $1 WHERE id = $2 RETURNING *', [
      type,
      id,
    ]);

    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
}

async function deleteType(id) {
  try {
    if (!id) throw new Error('Bad input: type id is not defined');

    // await client.query('DELETE FROM types WHERE id = $1', [id]);
    await client.query('UPDATE types SET deleted_at = $1 WHERE id = $2', [new Date(), id]);
    return true;
  } catch (err) {
    console.error(err.message || err);
    throw err;
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
