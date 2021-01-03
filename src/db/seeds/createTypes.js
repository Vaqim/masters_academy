exports.seed = async (knex) => {
  await knex('colors').del();
  await knex('types').del();

  await knex('colors').insert([
    { name: 'red' },
    { name: 'black' },
    { name: 'lime' },
    { name: 'navy' },
    { name: 'purple' },
  ]);

  await knex('types').insert([
    { name: 'gloves' },
    { name: 'socks' },
    { name: 'hat' },
    { name: 'jeans' },
  ]);
};
