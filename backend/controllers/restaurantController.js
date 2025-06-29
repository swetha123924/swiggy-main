import  pool from "../db/client.js";

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
};

// Get restaurant by ID
export const getMyRestaurants = async (req, res) => {
  const admin_id = req.user?.id;
  console.log(admin_id);
  
  if (!admin_id) {
    return res.status(400).json({ message: "Invalid admin token" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM restaurants WHERE admin_id = $1`,
      [admin_id]
    );

    res.status(200).json({ restaurants: result.rows });
  } catch (err) {
    console.error("Error fetching my restaurants:", err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
};


export const addRestaurant = async (req, res) => {
  const admin_id = req.user?.id;

  if (!admin_id) {
    return res.status(400).json({ message: "Invalid admin - no user ID found in token" });
  }

  const {
    restaurant_name,
    address,
    restaurant_type,
    url,
    ratings_for_swiggy,
    timing,
    location,
    city,
    offer,
    contact_number
  } = req.body;

  try {
    // Insert restaurant
    const result = await pool.query(
      `
      INSERT INTO restaurants (
        restaurant_name, address, restaurant_type, url, ratings_for_swiggy,
        timing, location, city, offer, contact_number, admin_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        restaurant_name,
        address,
        restaurant_type,
        url,
        ratings_for_swiggy,
        timing,
        location,
        city,
        offer,
        contact_number,
        admin_id
      ]
    );

    // Extract inserted restaurant
    const { id, restaurant_name: rname } = result.rows[0];

    // Create safe table names
    const safeName = rname
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");   // clean special characters

    const menuTable = `menu_${safeName}`;
    const paymentTable = `payment_${safeName}`;

    // Create Menu Table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${menuTable} (
          id SERIAL PRIMARY KEY,
          restaurant_name VARCHAR(100),
          item_name VARCHAR(100),
          image_url TEXT,
          description TEXT,
          price DECIMAL,
          rating DECIMAL,
          global_item_id INTEGER
        );
      `);

      console.log(`✅ Created menu table: ${menuTable}`);
    } catch (err) {
      console.error(`❌ Error creating menu table ${menuTable}:`, err);
    }

    // Create Payment Table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${paymentTable} (
          id SERIAL PRIMARY KEY,
          restaurant_name VARCHAR(100),
          user_name VARCHAR(255),
          item_name VARCHAR(255),
          quantity INTEGER NOT NULL DEFAULT 1,
          item_total NUMERIC(10,2) NOT NULL,
          total_paid NUMERIC(10,2) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'Pending',
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log(`✅ Created payment table: ${paymentTable}`);
    } catch (err) {
      console.error(`❌ Error creating payment table ${paymentTable}:`, err);
    }

    // Final response
    res.status(201).json({
      message: "Restaurant added, menu & payment tables created",
      restaurant_id: id,
      menu_table: menuTable,
      payment_table: paymentTable
    });
  } catch (err) {
    console.error("Error adding restaurant:", err);
    res.status(500).json({ message: "Failed to add restaurant" });
  }
};


// Update restaurant
export const updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const { name, address, cuisine_type, image_url, rating } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE restaurants
      SET name = $1, address = $2, cuisine_type = $3, image_url = $4, rating = $5
      WHERE id = $6
      RETURNING *
      `,
      [name, address, cuisine_type, image_url, rating, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update restaurant" });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM restaurants WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json({ message: "Deleted", restaurant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete restaurant" });
  }
};

