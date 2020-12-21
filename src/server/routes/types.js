const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { typesController } = require('../controllers');

const types = Router();

types.post(
  '/create',
  asyncHandler(async (req, res) => {
    try {
      await typesController.createTypeByParam(req.body, res);
    } catch (error) {
      console.log(error.message || error);
      throw error;
    }
  }),
);

types.get(
  '/read',
  asyncHandler(async (req, res) => {
    try {
      await typesController.getType(req.query, res);
    } catch (error) {
      console.log(error.message || error);
      throw error;
    }
  }),
);

types.patch(
  '/update',
  asyncHandler(async (req, res) => {
    try {
      await typesController.updateTypeByParams(req.body, res);
    } catch (error) {
      console.log(error.message || error);
      throw error;
    }
  }),
);

types.delete(
  '/delete',
  asyncHandler(async (req, res) => {
    try {
      typesController.deleteTypeById(req.query, res);
    } catch (err) {
      console.error(err);
    }
  }),
);

module.exports = types;
