// src/components/AddItems.jsx
import React, { useState } from 'react';
import apiClient from '../../../services/api';
import { FiUpload, FiHeart, FiStar } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { styles } from '../../../assets/dummyadmin';

const AddItems = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    rating: 0,
    hearts: 0,
    quantity: 0,
    total: 0,
    image: null,
    preview: ''
  });
  const [categories] = useState([
    'Breakfast', 'Lunch', 'Dinner', 'Mexican', 'Italian', 'Desserts', 'Drinks'
  ]);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleRating = rating =>
    setFormData(prev => ({ ...prev, rating }));

  const handleHearts = () =>
    setFormData(prev => ({ ...prev, hearts: prev.hearts + 1 }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'preview') return;
        payload.append(key, val);
      });
      const res = await apiClient.post('/api/items', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Item added successfully!');
      setFormData({
        name: '', description: '', category: '',
        price: '', rating: 0, hearts: 0,
        quantity: 0, total: 0, image: null, preview: ''
      });
    } catch (err) {
      alert('Error uploading item: ' + (err.response?.data?.message || err.message));
      console.error('Error uploading item:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.formWrapper}>
        <div className="max-w-4xl mx-auto">
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Add New Menu Item</h2>
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className={styles.uploadWrapper}>
                <label className={styles.uploadLabel}>
                  {formData.preview ? (
                    <img
                      src={formData.preview}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FiUpload className={styles.uploadIcon} />
                      <p className={styles.uploadText}>
                        Click to upload product image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              <div>
                <label className={styles.label}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={styles.input}
                  required
                />
              </div>

              <div>
                <label className={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  className={styles.textarea}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={styles.label}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={styles.label}>Price (₹) *</label>
                  <div className={styles.relativeInput}>
                    <FaRupeeSign className={styles.rupeeIcon} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      className={styles.inputWithIcon}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={styles.label}>Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <FiStar
                          className={`text-2xl ${
                            (hoverRating || formData.rating) >= star
                              ? 'text-amber-400 fill-current'
                              : 'text-amber-100/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={styles.label}>Quantity</label>
                  <div className={styles.relativeInput}>
                    <FiHeart className={styles.heartIcon} />
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={styles.inputWithIcon}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding Item...' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddItems;
