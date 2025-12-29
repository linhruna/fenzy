import React, { useEffect, useState } from 'react';
import { FaBox, FaShoppingCart, FaUsers, FaChartLine } from 'react-icons/fa';
import apiClient from '../../../services/api';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`${color} rounded-lg p-6 text-white shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-100 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <Icon size={40} className="opacity-20" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch items
        const itemsRes = await apiClient.get('/api/item');
        const ordersRes = await apiClient.get('/api/order');

        const items = itemsRes.data?.data || [];
        const orders = ordersRes.data?.orders || [];

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const pendingOrders = orders.filter(order => order.status !== 'delivered').length;

        setStats({
          totalItems: items.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue.toFixed(2),
          pendingOrders,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaBox}
          title="Total Items"
          value={stats.totalItems}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FaShoppingCart}
          title="Total Orders"
          value={stats.totalOrders}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={FaChartLine}
          title="Total Revenue"
          value={`$${stats.totalRevenue}`}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={FaUsers}
          title="Pending Orders"
          value={stats.pendingOrders}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/add-items"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-center transition font-semibold"
          >
            Add New Item
          </a>
          <a
            href="/admin/list-items"
            className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg text-center transition font-semibold"
          >
            Manage Items
          </a>
          <a
            href="/admin/orders"
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-center transition font-semibold"
          >
            View Orders
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
