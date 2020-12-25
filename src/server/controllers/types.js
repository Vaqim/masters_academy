const { createType, updateType, deleteType, getTypeById } = require('../../db');

async function getType({ id }, res) {
  try {
    if (!id) {
      res.json({ error: 'id is not defined :(' }).status(400);
      return false;
    }
    const type = await getTypeById(id);
    res.json(type);

    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

async function createTypeByParam({ type }, res) {
  try {
    if (!type) {
      res.json({ error: 'color is not defined :(' }).status(400);
    }

    const result = await createType(type);
    res.json(result);

    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

async function updateTypeByParams({ id, type }, res) {
  try {
    if (!id) {
      res.json({ error: 'id is not defined :(' }).status(400);
      return false;
    }

    const result = await updateType(id, type);

    res.json(result);

    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

async function deleteTypeById({ id }, res) {
  try {
    if (!id) {
      res.json({ error: 'id is not defined :(' }).status(400);
      return false;
    }

    await deleteType(id);
    res.json({ success: 'type deleted!' });
    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

module.exports = {
  getType,
  createTypeByParam,
  updateTypeByParams,
  deleteTypeById,
};
