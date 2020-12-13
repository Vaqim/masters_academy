const { Pool } = require('pg');

module.exports = (config) => {
  const client = new Pool(config);

  return {
    testConnection: async () => {
      try {
        console.log('Hello from pg test connection!');
        await client.query('SELECT NOW()');
      } catch (error) {
        console.error(error.message || error);
        throw error;
      }
    },

    close: async () => {
      console.log('closing pg wrapper');
      client.end();
    },

    createProduct: async ({ type, color, price, quantity = 0 }) => {
      try {
        if (!type) throw new Error('ERROR: no product type defined');
        if (!color) throw new Error('ERROR: no product color defined');
        if (!price) throw new Error('ERROR: no product price defined');

        const timestamp = new Date();

        const res = await client.query(
          'INSERT INTO products(type, color, price, quantity, created_at, updated_at, deleted_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [type, color, price, quantity, timestamp, timestamp, null],
        );

        console.log(`DEBUG: new product created: ${JSON.stringify(res.rows[0])}`);
        return res.rows[0];
      } catch (err) {
        console.error('');
      }
    },

    getProduct: async (id) => {
      try {
        if (!id) throw new Error('ERROR: No product id defined');
        const res = await client.query(
          'SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL',
          [id],
        );

        return res.rows[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    updateProduct: async ({ id, ...product }) => {
      try {
        if (!id) throw new Error('no id');

        const query = [];
        const values = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const [i, [k, v]] of Object.entries(product).entries()) {
          query.push(`${k} = ${i + 1}`);
          values.push(v);
        }

        if (!values.length) throw new Error('nothing to update');

        values.push(id);

        const res = await client.query(
          `UPDATE products SET ${query.join(',')} WHERE id = $${values.length} RETURNING *`,
          values,
        );

        console.log(`DEBUG: Proudct updated ${res.rows[0]}`);
        return true;
      } catch (error) {
        console.error(error.message || error);
        throw error;
      }
    },

    deleteProduct: async (id) => {
      try {
        if (!id) throw new Error('ERROR: No product id defined');
        // await client.query('DELETE FROM products WHERE id = $1', [id]); // hard delete
        await client.query('UPDATE products SET deleted_at = $1 WHERE id = $2', [new Date(), id]);
        return true;
      } catch (error) {
        console.error(error.message || error);
        throw error;
      }
    },
  };
};
