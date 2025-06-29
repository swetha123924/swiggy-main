import  pool from "../db/client.js";

// Add a new payment
export const submitPayment = async (req, res) => {
  const {
    user_id,
    item_id,
    item_name,
    restaurant_name,
    quantity,
    item_total,
    delivery_fee,
    gst,
    total_paid,
    payment_status,
    payment_table,
    user_name
  } = req.body;

  if (!user_id || !item_id || !restaurant_name || !payment_table) {
    return res.status(400).json({ error: "Missing required payment fields" });
  }

  try {
    // 1. Insert into global payments table
    const globalResult = await pool.query(
      `INSERT INTO payments (
        user_id, item_id, item_name, restaurant_name, quantity,
        item_total, delivery_fee, gst, total_paid, payment_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        user_id,
        item_id,
        item_name,
        restaurant_name,
        quantity,
        item_total,
        delivery_fee,
        gst,
        total_paid,
        payment_status,
      ]
    );

    // 2. Sanitize table name and create if not exists
    const safePaymentTable = payment_table.replace(/[^a-z0-9_]/gi, "");
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${safePaymentTable} (
        id SERIAL PRIMARY KEY,
        restaurant_name VARCHAR(100),
        user_name VARCHAR(255),
        item_name VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 1,
        item_total NUMERIC(10,2) NOT NULL,
        total_paid NUMERIC(10,2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    // 3. Insert into restaurant-specific payment table
    const restaurantResult = await pool.query(
      `INSERT INTO ${safePaymentTable} (
        restaurant_name, user_name, item_name, quantity, item_total, total_paid, payment_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        restaurant_name,
        user_name,
        item_name,
        quantity,
        item_total,
        total_paid,
        payment_status,
      ]
    );

    res.json({
      message: "Payment recorded successfully",
      global_payment: globalResult.rows[0],
      restaurant_payment: restaurantResult.rows[0],
    });
  } catch (err) {
    console.error("❌ Error submitting payment:", err);
    res.status(500).json({ error: "Server error while processing payment" });
  }
};


// Get user payment history
export const getPaymentsByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching user payments:", err);
    res.status(500).json({ message: "Error fetching user payments", error: err });
  }
};
