import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

function Dashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const resMenu = await fetch("http://localhost:5000/restaurant/restaurant-menu");
        const menuData = await resMenu.json();
        console.log(menuData);
        
        

        const resRestaurants = await fetch("http://localhost:5000/restaurant/restaurant-list");
        const restaurantData = await resRestaurants.json();
        console.log(restaurantData);
        

        const typeMap = {};
          restaurantData.forEach((rest) => {
          typeMap[rest.id] = rest.restaurant_type;
        });
        const restaurantMap = {};
        restaurantData.forEach((rest) => {
          restaurantMap[rest.id] = {
            name: rest.restaurant_name,
            type: rest.restaurant_type,
          };
        });

        const formatted = menuData.map((item) => {
        const restaurantName = restaurantMap[item.restaurant_id] || { name: "Unknown", type: "Unknown" };
        const itemName = item.item_name || item.Item_Name;
         const id = item.id || `${restaurantId}-${itemName.replace(/\s+/g, "-").toLowerCase()}`;
        const restaurantType = typeMap[item.restaurant_id] || "Unknown";

        return {
          id,
          restaurantName : restaurantName.name,
          itemName,
          description: item.description,
          rating: item.rating,
          price: item.price,
          offer: item.offer,
          offerPrice: item.offer_price,
          imageUrl: item.image_url,
          restaurantType,
          hasOffer: item.offer != null,
        };
      });

      setMenuItems(formatted);
      setFilteredItems(formatted);

const uniqueCategories = [
        "All",
        ...new Set(restaurantData.map((rest) => rest.restaurant_type)),
      ];
      setCategories(uniqueCategories);

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  fetchMenuItems();
}, []);
  const handleSearch = (query) => {
    let items = showOffersOnly
      ? menuItems.filter((item) => item.hasOffer)
      : [...menuItems];

    if (selectedCategory !== "All") {
      items = items.filter((item) => item.restaurantType === selectedCategory);
    }

    const filtered = query
      ? items.filter((item) =>
          (item.itemName?.toLowerCase() || "").includes(query.toLowerCase()) ||
          (item.restaurantName?.toLowerCase() || "").includes(query.toLowerCase()) ||
          (item.description?.toLowerCase() || "").includes(query.toLowerCase()) ||
          (item.price?.toString().toLowerCase() || "").includes(query.toLowerCase())
        )
      : items;

    setFilteredItems(filtered);
  };

  const handleOffersClick = () => {
    setShowOffersOnly(true);
    setSelectedCategory("All");
    const offerItems = menuItems.filter((item) => item.hasOffer);
    setFilteredItems(offerItems);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowOffersOnly(false);

    const filtered =
      category === "All"
        ? menuItems
        : menuItems.filter((item) => item.restaurantType === category);

    setFilteredItems(filtered);
  };

  useEffect(() => {
    if (showOffersOnly) handleOffersClick();
    else handleCategoryClick(selectedCategory);
  }, [menuItems]);

  return (
    <>
      <Header onSearch={handleSearch} onOffersClick={handleOffersClick} />

      <main className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {showOffersOnly ? "🔥 Hot Deals & Offers" : "🍽️ Explore Delicious Menus"}
        </h1>

        {isAdmin && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate("/admin")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition shadow"
            >
              Go to Admin Panel
            </button>
          </div>
        )}

        {!showOffersOnly && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold shadow transition ${
                  selectedCategory === category
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 hover:bg-red-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <p className="text-center text-gray-600">No matching items found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id || `item-${idx}`}
                onClick={() => navigate(`/item/${item.id}`, { state: { item, allItems: menuItems } })}
                className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg transition duration-300 overflow-hidden"
              >
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="w-full h-44 object-cover rounded-t-2xl"
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-bold text-gray-800">{item.itemName}</h3>
                  <p className="text-sm text-gray-600 font-semibold">{item.restaurantName}</p>
                  <p className="text-sm text-gray-600">{item.restaurantType}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm text-yellow-500">⭐ {item.rating}/5</p>

                  <div className="text-right">
                    {item.offerPrice ? (
                      <>
                        <span className="text-sm text-gray-500 line-through mr-2">
                          ₹{item.price}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{item.offerPrice}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-green-600">
                        ₹{item.price}
                      </span>
                    )}
                  </div>

                  {item.offer && (
                    <p className="text-sm text-red-600 font-medium">🎁 {item.offer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Dashboard;
