import { useState, useEffect } from "react";
import RestaurantForm from './ RestaurantForm'
import MenuItemForm from "./MenuItemForm";
import RestaurantCard from "./RestaurantCard";
import Header from "./header";
import Footer from "./footer";
import MenuItemCard from "./MenuItemCard";

export default function AdminPanel() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [showEditMenuItemForm, setShowEditMenuItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  // Fetch Restaurants
  const fetchRestaurants = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/restaurant/my-restaurants`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Fetched restaurants:", data);
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    }
  };

  // Fetch Menu Items
  const fetchMenuItems = async (menuTable) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/restaurant/get-menu-items/${menuTable}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Fetched menu items:", data);
      setMenuItems(data.menu_items || []);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  // // Edit Menu Item
const handleEditMenuItemSubmit = async (formPayload) => {
  console.log("EDIT SUBMIT → item_id:", formPayload.item_id, "global_id:", formPayload.global_item_id);
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `http://localhost:5000/restaurant/edit-menu-item/${formPayload.menu_table}/${formPayload.item_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_name: formPayload.item_name,
          description: formPayload.description,
          price: formPayload.price,
          image_url: formPayload.image_url,
          rating: formPayload.rating,
          restaurant_id: formPayload.restaurant_id,
          global_item_id: formPayload.global_item_id,
        }),
      }
    );

    const data = await res.json();
    console.log("Edit Response:", data);

    // Refresh
    fetchMenuItems(selectedRestaurant.menu_table);
    setShowEditMenuItemForm(false);

  } catch (err) {
    console.error("Error editing menu item:", err);
  }
};

const handleDeleteMenuItem = async (formPayload) => {
  console.log("Sending delete request with:");
  console.log("Menu table:", formPayload.menu_table);
  console.log("Item ID:", formPayload.item_id);
  console.log("Global ID:", formPayload.global_item_id);

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `http://localhost:5000/restaurant/delete-menu-item/${formPayload.menu_table}/${formPayload.item_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          global_item_id: formPayload.global_item_id,
        }),
      }
    );

    const data = await res.json();
    console.log("Delete response:", data);
    fetchMenuItems(formPayload.menu_table);
  } catch (err) {
    console.error("Error deleting menu item:", err);
  }
};





  // onMount → Fetch Restaurants
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // When selectedRestaurant changes → Fetch Menu Items
  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant.menu_table);
    }
  }, [selectedRestaurant]);

  return (
    <>
      <Header />

      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Admin Restaurant Panel
        </h1>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setShowRestaurantForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Add Restaurant
          </button>

          <button
            onClick={() => {
              if (selectedRestaurant) {
                setShowMenuItemForm(true);
              } else {
                alert("Please select a restaurant first!");
              }
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Add Menu Item
          </button>
        </div>

        {/* Restaurant Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => {
            const safeName = restaurant.restaurant_name
              .toLowerCase()
              .replace(/\s+/g, "_");
            const menuTable = `menu_${safeName}`;

            return (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={() =>
                  setSelectedRestaurant({
                    ...restaurant,
                    menu_table: menuTable,
                  })
                }
                onRefresh={fetchRestaurants}
              />
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {selectedRestaurant && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Menu for {selectedRestaurant.restaurant_name}
            </h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
              {menuItems.map((item) => (

                <MenuItemCard
  key={item.id}
  menuItem={item}
  onEdit={() => {
    console.log("Selected item for edit →", item);
    setEditingItem(item);
    setShowEditMenuItemForm(true);
  }}
  onDelete={() =>
  handleDeleteMenuItem({
    menu_table: selectedRestaurant.menu_table,
    item_id: item.id,
    global_item_id: item.global_item_id || item.global_id,
  })
}

/>

              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showRestaurantForm && (
        <RestaurantForm
          onClose={() => setShowRestaurantForm(false)}
          onRefresh={fetchRestaurants}
        />
      )}

      {/* Add Menu Item Modal */}
      {showMenuItemForm && selectedRestaurant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4 text-center">Add Menu Item</h2>
            <MenuItemForm
              restaurantId={selectedRestaurant.id}
              menuTable={selectedRestaurant.menu_table}
              userId={JSON.parse(localStorage.getItem("user"))?.id}
              onClose={() => setShowMenuItemForm(false)}
              onRefresh={() => {
                fetchRestaurants();
                fetchMenuItems(selectedRestaurant.menu_table);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditMenuItemForm && editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Menu Item</h2>
            <MenuItemForm
  restaurantId={selectedRestaurant.id}
    menuTable={selectedRestaurant.menu_table} // ✅ match prop name// ✅ This must be passed
  userId={JSON.parse(localStorage.getItem("user"))?.id}
  existingItem={editingItem}
  onClose={() => setShowEditMenuItemForm(false)}
  onSubmit={handleEditMenuItemSubmit}
/>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}



