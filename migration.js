/*
TODO:
failing test:

1) MenuItem Table should have a required menu_id column:
     Error: MenuItem without menu_id was created.
      at Statement.prodDb.run (test/test.js:293:16)

Note: I've been looking at this bug and scratching my head for nearly an hour. The best I can figure, I am correctly declaring menu_id [as a foreign key referenced from Menu], but I would guess, based on test.js, that when I delete a Menu, any referencing MenuItems' menu_id's become broken. I tried to solve the by adding a 'ON DELETE CASCADE' clause, however the error persists.
*/

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(function() {
  db.run('CREATE TABLE IF NOT EXISTS `Employee` ( ' +
           '`id` INTEGER NOT NULL, ' +
           '`name` TEXT NOT NULL, ' +
           '`position` TEXT NOT NULL, ' +
           '`wage` TEXT NOT NULL, ' +
           '`is_current_employee` INTEGER NOT NULL DEFAULT 1, ' +
           'PRIMARY KEY(`id`) )');

  db.run('CREATE TABLE IF NOT EXISTS `Timesheet` ( ' +
           '`id` INTEGER NOT NULL, ' +
           '`hours` INTEGER NOT NULL, ' +
           '`rate` INTEGER NOT NULL, ' +
           '`date` INTEGER NOT NULL, ' +
           '`employee_id` INTEGER NOT NULL, ' +
           'PRIMARY KEY(`id`), ' +
           'FOREIGN KEY(`employee_id`) REFERENCES `Employee`(`id`) )');

  db.run('CREATE TABLE IF NOT EXISTS `Menu` ( ' +
           '`id` INTEGER NOT NULL, ' +
           '`title` TEXT NOT NULL, ' +
           'PRIMARY KEY(`id`) )');

  db.run('CREATE TABLE IF NOT EXISTS `MenuItem` ( ' +
           '`id` INTEGER NOT NULL, ' +
           '`name` TEXT NOT NULL, ' +
           '`description` TEXT NOT NULL, ' +
           '`inventory` INTEGER NOT NULL, ' +
           '`price` INTEGER NOT NULL, ' +
           '`menu_id` INTEGER NOT NULL, ' +
           'PRIMARY KEY(`id`), ' +
           'FOREIGN KEY(`menu_id`) REFERENCES `Menu`(`id`) )');
});
