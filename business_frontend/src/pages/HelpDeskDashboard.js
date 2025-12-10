import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function HelpDeskDashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("userToken");
    sessionStorage.clear();

    navigate("/");
}

  return (
            <div className="App">
            <header className="App-header">Help Desk Dashboard</header>

            <main className="min-h-screen bg-slate-100">


              <div className="button-container">
                  <button className="button" onClick={() => navigate("/dbviewer")}>
                      Database Viewer
                  </button>

                  <button className="button" onClick={() => navigate("/recordeditor")}>
                      Update Records
                  </button>

                  <button className="button" onClick={() => navigate("/analytics/products")}>
                      Product Analytics
                  </button>

                <button className="button" onClick={() => navigate("/analytics/business")}>
                      Seller Analytics
                  </button>
              </div>


            </main>

            <div
                className="tooltip tooltip-left"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "20px",
                }}
            >
                <button
                    className="button"
                    style={{
                        borderRadius: "50%",
                        width: "60px",
                        height: "60px",
                        fontSize: "1.3em",
                        backgroundColor: "#b30000",
                    }}
                    onClick={handleLogout}
                >
                    ↩
                </button>
                <span className="tooltip-text">Sign Out</span>
            </div>
            <footer className="App-footer">
                © {new Date().getFullYear()} Team Progress | Penn State
            </footer>

            </div>
  );
}


