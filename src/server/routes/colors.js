const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { colorsController } = require('../controllers');

const colors = Router();

colors.post(
  '/create',
  asyncHandler(async (req, res) => {
    try {
      await colorsController.createColorByParam(req.body, res);
    } catch (error) {
      console.log(error.message || error);
      throw error;
    }
  }),
);

colors.get(
  '/read',
  asyncHandler(async (req, res) => {
    try {
      await colorsController.getColor(req.query, res);
    } catch (error) {
      console.log(error.message || error);
      throw error;
    }
  }),
);

colors.patch(
  '/update',
  asyncHandler(async (req, res) => {
    try {
      await colorsController.updateColorByParams(req.body, res);
    } catch (error) {
      console.log(error.message || error);
      throw error;
    }
  }),
);

colors.delete(
  '/delete',
  asyncHandler(async (req, res) => {
    try {
      colorsController.deleteColorById(req.query, res);
    } catch (err) {
      console.error(err);
    }
  }),
);
