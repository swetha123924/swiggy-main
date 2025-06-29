

import express from "express";
import { verifyAdmin } from "../middleware/auth.js";
import {
  getAllMenuItems,
  getMenuByRestaurantId,
  addMenuItem,
  getMenuItems,
  editMenuItem,
  deleteMenuItem
} from "../controllers/restaurantMenuController.js";

const router = express.Router();

router.get("/restaurant-menu", getAllMenuItems);
router.get("/get-menu-items/:menu_table", getMenuItems);

router.get("/restaurant-menu-items/:restaurant_id", getMenuByRestaurantId);

router.post("/:restaurantId/menu-items", addMenuItem);

router.delete("/delete-menu-item/:menu_table/:item_id", deleteMenuItem);

router.put("/edit-menu-item/:menu_table/:item_id", editMenuItem);


export default router;
