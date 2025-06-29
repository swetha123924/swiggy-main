

export default function RestaurantCard({ restaurant, onSelect, onRefresh }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-xl font-bold mb-2">{restaurant.restaurant_name}</h2>
      <p className="text-gray-600">{restaurant.address}</p>
      <p className="text-gray-600">Type: {restaurant.restaurant_type}</p>
      <button
        onClick={onSelect}  // only call parent function!
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Select Restaurant (for adding Menu)
      </button>
    </div>
  );
}

