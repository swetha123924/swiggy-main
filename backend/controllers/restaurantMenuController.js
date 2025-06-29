import pool from "../db/client.js";

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurant_menu_items");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching restaurant menu:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get menu by restaurant ID
export const getMenuByRestaurantId = async (req, res) => {
  const { restaurant_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM restaurant_menu_items WHERE restaurant_id = $1",
      [restaurant_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No menu items found" });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
};
export const getMenuItems = async (req, res) => {
  const { menu_table } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM ${menu_table}`);
    res.json({ menu_items: result.rows });
  } catch (err) {
    console.error("Error fetching menu items:", err);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};



export const addMenuItem = async (req, res) => {
  const restaurantId = req.params.restaurantId; // <-- this is required!

  const { menu_table, item_name, description, price, image_url, rating } = req.body;
  // Insert into global table first
const result2 = await pool.query(
  `
  INSERT INTO restaurant_menu_items (restaurant_id, item_name, description, price, image_url, rating)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `,
  [restaurantId, item_name, description, price, image_url, rating]
);

const globalItemId = result2.rows[0].id;

// Now insert into dynamic table with global_item_id
const result1 = await pool.query(
  `
  INSERT INTO ${menu_table} (restaurant_name, item_name, description, price, image_url, rating, global_item_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `,
  [
    menu_table.replace('menu_', '').replace('_', ' '),
    item_name,
    description,
    price,
    image_url,
    rating,
    globalItemId
  ]
);

res.status(201).json({
  restaurant_menu_item: result1.rows[0],
  global_menu_item: result2.rows[0],
  message: "Menu item added successfully!"
});
};


export const editMenuItem = async (req, res) => {
  console.log("PARAMS:", req.params);
console.log("BODY:", req.body);
  const { menu_table, item_id } = req.params;
  const {
    item_name,
    description,
    price,
    image_url,
    rating,
    global_item_id,
  } = req.body;

  // Validation: make sure all required fields are present
  if (!menu_table || !item_id || !global_item_id) {
    return res.status(400).json({
      error: "Missing menu_table, item_id, or global_item_id",
    });
  }

  console.log("🛠 Editing menu item:", {
    menu_table,
    item_id,
    global_item_id,
    item_name,
  });

  try {
    // Sanitize dynamic table name to prevent SQL injection
    const safeMenuTable = menu_table.replace(/[^a-z0-9_]/gi, "");

    // Update the restaurant's own menu table
    const result = await pool.query(
      `
      UPDATE ${safeMenuTable}
      SET item_name = $1,
          description = $2,
          price = $3,
          image_url = $4,
          rating = $5
      WHERE id = $6
      RETURNING *
      `,
      [item_name, description, price, image_url, rating, item_id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Item not found in the restaurant menu table" });
    }

    const updatedItem = result.rows[0];
    console.log("✅ Updated in restaurant table:", updatedItem);

    // Update the global menu items table
    const globalResult = await pool.query(
      `
      UPDATE restaurant_menu_items
      SET item_name = $1,
          description = $2,
          price = $3,
          image_url = $4,
          rating = $5
      WHERE id = $6
      RETURNING *
      `,
      [item_name, description, price, image_url, rating, global_item_id]
    );

    if (globalResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Item not found in the global menu table" });
    }

    const updatedGlobalItem = globalResult.rows[0];
    console.log("🌍 Updated in global table:", updatedGlobalItem);

    res.json({
      message: "Menu item updated successfully",
      updatedItem,
      updatedGlobalItem,
    });

  } catch (err) {
    console.error("❌ Error updating menu item:", err);
    res.status(500).json({ error: "Server error during menu update" });
  }
};


export const deleteMenuItem = async (req, res) => {
  const { menu_table, item_id } = req.params;
  const { global_item_id } = req.body;

  if (!menu_table || !item_id || !global_item_id) {
    return res.status(400).json({
      error: "Missing menu_table, item_id, or global_item_id",
    });
  }

  const safeMenuTable = menu_table.replace(/[^a-z0-9_]/gi, "");

  try {
    const result = await pool.query(
      `DELETE FROM ${safeMenuTable} WHERE id = $1 RETURNING *`,
      [item_id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Menu item not found in specific table" });
    }

    const deletedSpecificItem = result.rows[0];

    const globalResult = await pool.query(
      `DELETE FROM restaurant_menu_items WHERE id = $1 RETURNING *`,
      [global_item_id]
    );

    const deletedGlobalItem = globalResult.rows[0];

    res.json({
      message: "Menu item deleted from both tables",
      deletedSpecificItem,
      deletedGlobalItem,
    });

  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};
