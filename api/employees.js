const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets.js');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId', {$employeeId: employeeId}, (error, employee) => {
    if(error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

const validateEmployee = (req, res, next) => {
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
    return res.sendStatus(400);
  }
  next();
}

employeesRouter.post('/', validateEmployee, (req, res, next) => {
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)', {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $isCurrentEmployee: isCurrentEmployee
  }, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (error, employee) => {
        res.status(201).json({employee: employee});
      });
    }
  });
});

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId', {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  }, (error) => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, employee) => {
        res.status(200).json({employee: employee});
      });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run('UPDATE Employee SET is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId', {
    $isCurrentEmployee: 0,
    $employeeId: req.params.employeeId
  }, (error) => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
        res.status(200).json({employee: employee});
      });
    }
  });
});

module.exports = employeesRouter;
