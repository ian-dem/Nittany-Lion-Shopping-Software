import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import HelpDeskDashboard from "./pages/HelpDeskDashboard";
import Register from "./pages/Register";
import RegisterUser from "./pages/RegisterUser";
import RegisterSeller from "./pages/RegisterSeller";
import ProductsListPage from "./pages/ProductsListPage";
import DBViewerPage from "./pages/DBViewerPage";
import EditRecord from "./pages/recordeditor";
import ProductAnalytics from "./pages/ProductAnalytics";
import NoSellerAccess from "./pages/NoSellerAccess";
import SellerAnalytics from "./pages/SellerAnalytics";


const role = localStorage.getItem("userRole");
if (role === "undefined" || role === "null") {
    localStorage.removeItem("userRole");
}

function ProtectedRoute({ allowedRoles, children }) {
    let role = localStorage.getItem("userRole");
    if (role) role = role.replace(/['"\s]/g, "").toLowerCase();
    if (!role || !allowedRoles.includes(role)) return <Navigate to="/" />;

    return children;
}

// Default redirect handler for the root path
function DefaultRedirect() {
    const role = localStorage.getItem("userRole");
    if (role === "seller" || role === "helpdesk") return <Navigate to="/seller" />;
    if (role === "buyer") return <Navigate to="/buyer" />;
    if (role === "helpdesk") return <Navigate to="/helpdesk" />;
    return <Login />;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* PUBLIC: login + register */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/registerUser" element={<RegisterUser />} />
                <Route path="/registerSeller" element={<RegisterSeller />} />
                <Route path="/noselleraccess" element={<NoSellerAccess />} />

                {/* PRIVATE: dashboards */}
                <Route
                    path="/seller"
                    element={
                        <ProtectedRoute allowedRoles={["seller", "helpdesk"]}>
                            <SellerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buyer"
                    element={
                        <ProtectedRoute allowedRoles={["buyer", "seller", "helpdesk"]}>
                            <BuyerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/helpdesk"
                    element={
                        <ProtectedRoute allowedRoles={["helpdesk"]}>
                            <HelpDeskDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/dbviewer" element={<DBViewerPage />} />
                <Route path="/products" element={<ProductsListPage />} />
                <Route path="/recordeditor" element={<EditRecord />} />
                <Route path="/analytics/products" element={<ProductAnalytics />} />
                <Route path="/home" element={<DefaultRedirect />} />
                <Route path="/login" element={<DefaultRedirect />} />
                <Route path="/analytics/business" element={<SellerAnalytics />} />
            </Routes>
        </Router>
    );
}

export default App;
