// src/components/Admin/ListItems/ListItems.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import { FiTrash2, FiStar, FiEdit2 } from 'react-icons/fi';
import { styles } from '../../../assets/dummyadmin';

const ListItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ price: '', quantity: '' });

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await apiClient.get('/api/items');
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Delete handler
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiClient.delete(`/api/items/${itemId}`);
      setItems(prev => prev.filter(item => item._id !== itemId));
      alert('Item deleted successfully');
    } catch (err) {
      alert('Error deleting item: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting item:', err);
    }
  };

  // Edit handler
  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditData({ price: item.price, quantity: item.quantity || 0 });
  };

  const handleSaveEdit = async (itemId) => {
    try {
      const { data } = await apiClient.patch(`/api/items/${itemId}`, {
        price: Number(editData.price),
        quantity: Number(editData.quantity),
      });
      setItems(prev => prev.map(item => item._id === itemId ? data : item));
      setEditingId(null);
      alert('Item updated successfully');
    } catch (err) {
      alert('Error updating item: ' + (err.response?.data?.message || err.message));
      console.error('Error updating item:', err);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`text-xl ${i < rating ? 'text-amber-400 fill-current' : 'text-amber-100/30'}`}
      />
    ));

  if (loading) {
    return (
      <div className={styles.pageWrapper + ' flex items-center justify-center text-amber-100'}>
        Loading menu…
      </div>
    );
  }

  return (
      <div className={styles.pageWrapper}>
        <div className="max-w-7xl mx-auto">
          <div className={styles.cardContainer}>
            <h2 className={styles.title}>Manage Menu Items</h2>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.th}>Image</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Price (₹)</th>
                    <th className={styles.th}>Rating</th>
                    <th className={styles.th}>Quantity</th>
                    <th className={styles.thCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} className={styles.tr}>
                      <td className={styles.imgCell}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={styles.img}
                        />
                      </td>
                      <td className={styles.nameCell}>
                        <div className="space-y-1">
                          <p className={styles.nameText}>{item.name}</p>
                          <p className={styles.descText}>{item.description}</p>
                        </div>
                      </td>
                      <td className={styles.categoryCell}>{item.category}</td>
                      <td className={styles.priceCell}>
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editData.price}
                            onChange={e => setEditData({ ...editData, price: e.target.value })}
                            className="w-20 bg-amber-900/30 border border-amber-500 rounded px-2 py-2 text-amber-100 text-base h-9"
                          />
                        ) : (
                          `₹${item.price}`
                        )}
                      </td>
                      <td className={styles.ratingCell}>
                        <div className="flex gap-1">{renderStars(item.rating)}</div>
                      </td>
                      <td className={styles.heartsCell}>
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editData.quantity}
                            onChange={e => setEditData({ ...editData, quantity: e.target.value })}
                            className="w-20 bg-amber-900/30 border border-amber-500 rounded px-2 py-2 text-amber-100 text-base h-9"
                            min="0"
                          />
                        ) : (
                          <span>{item.quantity || 0}</span>
                        )}
                      </td>
                      <td className="p-4 text-center flex gap-2 justify-center items-end">
                        {editingId === item._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(item._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(item)} className="text-amber-400 hover:text-amber-300 p-2">
                              <FiEdit2 className="text-xl" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className={styles.deleteBtn}>
                              <FiTrash2 className="text-xl" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <div className={styles.emptyState}>
                No items found in the menu
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ListItems;
