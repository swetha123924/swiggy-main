import { useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function RestaurantForm({ onClose, onRefresh }) {
const [formData, setFormData] = useState({
    restaurant_name: "",
    url: "",
    timing: "",
    address: "",
    location: "",
    city: "",
    offer: "",
    contact_number: "",
    restaurant_type: "",
    ratings_for_swiggy: "",
  });



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const token = localStorage.getItem("token");
console.log("Token before submit:", token);
const decoded = jwtDecode(token);
console.log("Decoded token:", decoded);


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/restaurant/add-restaurant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,  // <-- also add "Bearer "
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onRefresh();
      onClose();
    } else {
      const errorData = await res.json();
      console.error("Failed to add restaurant:", errorData);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Add New Restaurant</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="restaurant_name"
            placeholder="Restaurant Name"
            value={formData.restaurant_name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="url"
            placeholder="Image URL"
            value={formData.url}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="timing"
            placeholder="Timing"
            value={formData.timing}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="offer"
            placeholder="Offer"
            value={formData.offer}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="restaurant_type"
            placeholder="Restaurant Type"
            value={formData.restaurant_type}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            step="0.1"
            name="ratings_for_swiggy"
            placeholder="Ratings"
            value={formData.ratings_for_swiggy}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div className="col-span-2 flex justify-end mt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
