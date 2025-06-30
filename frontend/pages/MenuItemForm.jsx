import { useState, useEffect } from "react";

export default function MenuItemForm({
  restaurantId,
  menuTable,
  userId,
  onClose,
  onRefresh,
  onSubmit, // for edit mode
  existingItem, // if passed → edit mode
}) {
  const [form, setForm] = useState({
    item_name: "",
    description: "",
    price: "",
    image_url: "",
    rating: "",
  });

  const token = localStorage.getItem("token");
    const BASE_URL = "https://swiggy-main-1.onrender.com"



  // When existingItem changes → pre-fill form
  useEffect(() => {
    if (existingItem) {
      setForm({
        item_name: existingItem.item_name || "",
        description: existingItem.description || "",
        price: existingItem.price || "",
        image_url: existingItem.image_url || "",
        rating: existingItem.rating || "",
      });
    } else {
      setForm({
        item_name: "",
        description: "",
        price: "",
        image_url: "",
        rating: "",
      });
    }
  }, [existingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  const payload = {
  menu_table: menuTable,
  item_id: existingItem?.id, // ✅ safe access
  global_item_id: existingItem?.global_item_id || existingItem?.global_id,
  item_name: form.item_name,
  description: form.description,
  price: form.price,
  image_url: form.image_url,
  rating: form.rating,
};
console.log("Payload being submitted:", payload);



    try {
      if (existingItem) {
  // Edit mode
  await onSubmit(payload);
  onRefresh && onRefresh();
  onClose();
} else {
  // Add mode
  const res = await fetch(
    `${BASE_URL}/restaurant/${restaurantId}/menu-items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        menu_table: menuTable,
        ...payload,
        user_id: userId,
      }),
    }
  );

  const data = await res.json();
  console.log("Add Menu Item Response:", data);
  onRefresh && onRefresh();
  onClose();
}
    } catch (err) {
      console.error("Error submitting menu item:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold mb-2">
          {existingItem ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        <input
          type="text"
          placeholder="Item Name"
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          step="0.1"
          placeholder="Rating (1-5)"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {existingItem ? "Update" : "Add"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
