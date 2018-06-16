const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId', {$timesheetId: timesheetId}, (error, timesheet) => {
    if(error) {
      next(error);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId', { $employeeId: req.params.employeeId}, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

const validateTimesheet = (req, res, next) => {
  db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId', {$timesheetId: req.body.timesheet.timesheetId}, (error, timesheet) => {
    if (error) {
      next(error);
    } else {
      if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
        return res.sendStatus(400);
      }
      next();
    }
  });
}

timesheetsRouter.post('/', validateTimesheet, (req, res, next) => {
  db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)', {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $employeeId: req.params.employeeId
  }, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet) => {
        res.status(201).json({timesheet: timesheet});
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.id = $timesheetId', {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $timesheetId: req.params.timesheetId
  }, (error) => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (error, timesheet) => {
        res.status(200).json({timesheet: timesheet});
      });
    }
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run('DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId',{ $timesheetId: req.params.timesheetId }, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
