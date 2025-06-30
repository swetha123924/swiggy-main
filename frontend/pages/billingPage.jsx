import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import AddressForm from "./address ";

export default function BillingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState("address");

  const item = state?.item;
  const quantity = state?.quantity;
  const itemTotal = state?.itemTotal;
  const deliveryFee = state?.deliveryFee;
  const gst = state?.gst;
  const total = state?.total;
  console.log(item.id)

  if (!item || !quantity || !total) {
    return (
      <p className="text-center text-red-500 mt-10">
        Missing order details. Please go back.
      </p>
    );
  }

  const handleAddressSubmit = () => {
    setStep("billing");
  };

const handleBillingSubmit = async () => {
 const token = localStorage.getItem("token");
console.log("Token being sent:", token);

  const user = JSON.parse(localStorage.getItem("user"));
  const paymentTable = `payments_${(item?.restaurant_name || "default").toLowerCase().replace(/\s+/g, "_")}`;

  console.log("Item data:", item);

  const payload = {
    user_id: user?.id,
    item_id: item.id,
    item_name: item.itemName,
   restaurant_name: item.restaurantName,
    quantity,
    item_total: itemTotal,
    delivery_fee: deliveryFee,
    gst,
    total_paid: total,
    payment_status: "Success",
    payment_table: paymentTable, // ✅ needed for dynamic insertion
    user_name: user?.name,
  };

  console.log("Payload being sent:", payload);
  const BASE_URL = "https://swiggy-main-1.onrender.com"


  try {
    const res = await fetch(`${BASE_URL}/payments/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Payment success:", data);

    // alert(`Order placed! Payment of ₹${total} successful.`);
    navigate("/");

  } catch (err) {
    console.error("Payment failed:", err);
    alert("Payment failed. Please try again.");
  }
};


  return (
    <>
      <Header />
      <div className="min-h-screen p-6 md:p-12 bg-gray-50">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🧾 Checkout</h2>

          {step === "address" && <AddressForm onSubmit={handleAddressSubmit} />}

          {step === "billing" && (
            <div className="space-y-4">
              <p className="text-gray-700">Review your order:</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 overflow-hidden rounded-xl shadow">
                  <img
                    src={item.imageUrl}
                    alt={item.itemName || "Food Item"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                 <p className="font-semibold text-gray-800">{item.itemName}</p>
<p className="text-sm text-gray-500">Restaurant: {item.restaurantName}</p>
<p className="text-sm text-gray-500">Quantity: {quantity}</p>

                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>₹{itemTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹{gst}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
                        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-1 text-gray-800">
              🚫 No-contact Delivery
            </h4>
            <p className="text-sm text-gray-600">
              Unwell or avoiding contact? Partner will safely place the order at your
              door.
            </p>
          </div>
              <button
                onClick={handleBillingSubmit}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
              >
                Pay ₹{total}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
