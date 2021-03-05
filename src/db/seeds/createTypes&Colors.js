exports.seed = async (knex) => {
  await Promise.all([knex('colors').del(), knex('types').del()]);

  const createColors = knex('colors').insert([
    { name: 'red' },
    { name: 'black' },
    { name: 'lime' },
    { name: 'navy' },
    { name: 'purple' },
  ]);

  const createTypes = knex('types').insert([
    { name: 'gloves' },
    { name: 'socks' },
    { name: 'hat' },
    { name: 'jeans' },
  ]);

  await Promise.all([createColors, createTypes]);
};
