const { Router } = require('express');
const { taskController } = require('../controllers');

const task = Router();

task.get('/filter', (req, res) => {
  taskController.getFilter(res, req.query);
});

task.get('/highest_price', (req, res) => {
  taskController.getMaxCost(res);
});

task.get('/format', (req, res) => {
  taskController.format(res);
});

task.post('/edit', (req, res) => {
  taskController.edit(res, req.body);
});

module.exports = task;
