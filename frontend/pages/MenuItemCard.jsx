import { Pencil, Trash2 } from "lucide-react";

export default function MenuItemCard({ menuItem, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded shadow p-2 flex flex-col m-2">
      <img
        src={menuItem.image_url}
        alt={menuItem.item_name}
        className="w-full h-40 object-cover rounded mb-4"
      />
      <h3 className="text-lg font-bold mb-2">{menuItem.item_name}</h3>
      <p className="text-gray-600 mb-2">{menuItem.description}</p>
      <p className="text-indigo-600 font-bold mb-2">Price: ₹{menuItem.price}</p>
      <p className="text-yellow-500 mb-4">Rating : {menuItem.rating}⭐</p>
      <p>global_item_id : {menuItem.global_item_id}</p>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
        >
          <Pencil className="inline-block w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          <Trash2 className="inline-block w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
