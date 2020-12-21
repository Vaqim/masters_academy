const { createColor, updateColor, deleteColor, getColorById } = require('../../db');

async function getColor({ id }, res) {
  try {
    if (!id) {
      res.send('id is not defined :(').status(400);
      return false;
    }
    const color = await getColorById(id);
    res.json(color);

    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

async function createColorByParam({ color }, res) {
  try {
    if (!color) {
      res.send('color is not defined :(').status(400);
    }

    const result = await createColor(color);
    res.json(result);

    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

async function updateColorByParams({ id, color }, res) {
  try {
    if (!id) {
      res.send('id is not defined :(').status(400);
      return false;
    }

    const result = await updateColor(id, color);

    res.json(result);

    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

async function deleteColorById({ id }, res) {
  try {
    if (!id) {
      res.send('id is not defined :(').status(400);
      return false;
    }

    await deleteColor(id);
    res.send('color deleted!');
    return true;
  } catch (err) {
    console.error(err.message || err);
    res.send('Ooops..!').status(500);
  }
}

module.exports = {
  getColor,
  createColorByParam,
  updateColorByParams,
  deleteColorById,
};
