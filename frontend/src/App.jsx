import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import SignUp from './components/SignUp/SignUp';
import ContactPage from './pages/ContactPage/ContactPage';
import CheckoutPage from './pages/Checkout/Checkout';
import AboutPage from './pages/AboutPage/AboutPage';
import Menu from './pages/Menu/Menu';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout';

import MyOrders from './pages/MyOredrs/MyOrders';
import VerifyPaymentPage from './pages/VerifyPaymentPage/VerifyPaymentPage';

// Admin Components
import AddItems from './components/Admin/AddItems/AddItems';
import ListItems from './components/Admin/ListItems/ListItems';
import Orders from './components/Admin/Orders/Orders';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Home />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/menu" element={<Menu />} />

      {/* Payment verification */}
      <Route path="/myorder/verify" element={<VerifyPaymentPage />} />

      {/* Protected - Client Routes */}
      <Route
        path="/cart"
        element={<PrivateRoute><Cart /></PrivateRoute>}
      />
      <Route
        path="/checkout"
        element={<PrivateRoute><CheckoutPage /></PrivateRoute>}
      />

      {/* The actual orders list */}
      <Route
        path="/myorder"
        element={<PrivateRoute><MyOrders /></PrivateRoute>}
      />

      {/* Protected - Admin Routes with Layout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <ListItems />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/add-items"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddItems />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/list-items"
        element={
          <AdminRoute>
            <AdminLayout>
              <ListItems />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
