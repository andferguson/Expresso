const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get('SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: menuItemId}, (error, menuItem) => {
    if(error) {
      next(error);
    } else if (menuItem) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId', { $menuId: req.params.menuId}, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});

const validateMenuItem = (req, res, next) => {
  db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: req.body.menuItem.menuId}, (error) => {
    if (error) {
      next(error);
    } else {
      if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price) {
        return res.sendStatus(400);
      }
      next();
    }
  });
}

menuItemsRouter.post('/', validateMenuItem, (req, res, next) => {
  db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)', {
    $name: req.body.menuItem.name,
    $description: req.body.menuItem.description,
    $inventory: req.body.menuItem.inventory,
    $price: req.body.menuItem.price,
    $menuId: req.params.menuId
  }, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
        res.status(201).json({menuItem: menuItem});
      });
    }
  });
});

menuItemsRouter.put('/:menuItemId', validateMenuItem, (req, res, next) => {
  db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId', {
    $name: req.body.menuItem.name,
    $description: req.body.menuItem.description,
    $inventory: req.body.menuItem.inventory,
    $price: req.body.menuItem.price,
    $menuItemId: req.params.menuItemId
  }, (error) => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (error, menuItem) => {
        res.status(200).json({menuItem: menuItem});
      });
    }
  });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run('DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId',{ $menuItemId: req.params.menuItemId }, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
