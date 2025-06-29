import express from "express";
import {
  getAllRestaurants,
  getMyRestaurants,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant
} from "../controllers/restaurantController.js";

import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/restaurant-list", getAllRestaurants);
router.get("/my-restaurants", verifyAdmin, getMyRestaurants);
router.post("/add-restaurant", verifyAdmin, addRestaurant);

router.put("/restaurant/:id", verifyAdmin, updateRestaurant);
router.delete("/restaurant/:id", verifyAdmin, deleteRestaurant);

export default router;
