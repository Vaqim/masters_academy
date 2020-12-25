const { createColor, createType, close, testConnection } = require('../index');

const colors = ['red', 'black', 'lime', 'navy', 'purple'];
const types = ['socks', 'gloves', 'hat', 'jeans'];

const seeds = async () => {
  try {
    await testConnection();

    colors.forEach(async (e) => {
      await createColor(e);
    });

    types.forEach(async (e) => {
      await createType(e);
    });

    close();
  } catch (error) {
    console.error('Seeds Error: ', error.message || error);
  }
};

seeds();
