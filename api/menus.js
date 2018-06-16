const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: menuId}, (error, menu) => {
    if(error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

const validateMenu = (req, res, next) => {
  if (!req.body.menu.title) {
    return res.sendStatus(400);
  }
  next();
}

menusRouter.post('/', validateMenu, (req, res, next) => {
  db.run('INSERT INTO Menu (title) VALUES ($title)', {
    $title: req.body.menu.title
  }, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
        res.status(201).json({menu: menu});
      });
    }
  });
});

menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
  db.run('UPDATE Menu SET title = $title WHERE Menu.id = $menuId', {
    $title: req.body.menu.title,
    $menuId: req.params.menuId
  }, (error) => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
        res.status(200).json({menu: menu});
      });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  db.get('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId', {$menuId: req.params.menuId}, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      res.sendStatus(400);
    } else {
      db.run('DELETE FROM Menu WHERE Menu.id = $menuId', {$menuId: req.params.menuId}, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = menusRouter;
