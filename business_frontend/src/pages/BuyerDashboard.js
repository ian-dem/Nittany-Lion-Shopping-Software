import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import CreateTicket from "../components/CreateTicket";
import DashboardSwitcher from "../components/DashboardSwitch";
import "../App.css";

const API = "http://localhost:5000/api";

function BuyerDashboard() {
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail"); // must be set at login

  const [section, setSection] = useState("recommended");  // DEFAULT TAB = recommended
  const [orders, setOrders] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [cart, setCart] = useState({});

  const [buyer, setBuyer] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editData, setEditData] = useState({ name: "", email: "", password: "" });

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cardFormData, setCardFormData] = useState({
      credit_card_num: "",
      card_type: "",
      expire_month: "",
      expire_year: "",
      security_code: ""
    });

  // -------------------------------------------
  // Load dashboard data on mount
  // -------------------------------------------
  useEffect(() => {
    if (!userEmail) return;

    fetch(`${API}/buyer/${userEmail}`)
      .then(res => res.json())
      .then(setBuyer);

    fetch(`${API}/buyer/orders/${userEmail}`)
      .then(res => res.json())
      .then(setOrders);

    fetch(`${API}/buyer/recommended`)
      .then(res => res.json())
      .then(setRecommended);
  }, [userEmail]);


  useEffect(() => {
  if (!userEmail) return;

  fetch(`http://localhost:5000/api/card/${userEmail}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.card) {
        setCardFormData(data.card);
      }
    })
    .catch(() => {});
}, [userEmail]);


  // -------------------------------------------
  // Product Search
  // -------------------------------------------
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`${API}/products/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(setSearchResults);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);


  // -------------------------------------------
  // Cart
  // -------------------------------------------
const addToCart = (product) => {
  setCart((prevCart) => {
    const id = product.ProductID;

    const existingQty = prevCart[id]?.Quantity || 0;

    return {
      ...prevCart,
      [id]: {
        ProductID: product.ProductID,
        Name: product.Name,
        Price: product.Price,
        BusinessID: product.BusinessID,   // <-- REQUIRED
        Quantity: existingQty + 1
      }
    };
  });
};


 
useEffect(() => {
  async function loadCard() {
    const res = await fetch(`http://localhost:5000/api/card/${userEmail}`);
    const saved = await res.json();

    if (saved.success) {
      setCardFormData({
        credit_card_num: saved.card.credit_card_num,
        card_type: saved.card.card_type,
        expire_month: saved.card.expire_month,
        expire_year: saved.card.expire_year,
        security_code: "" // You should NOT autofill this
      });
    }
  }

  if (showCheckoutModal) loadCard();
}, [showCheckoutModal]);


  // -------------------------------------------
  // Account Edit Save
  // -------------------------------------------
const saveAccountChanges = async () => {
  const body = {
    oldEmail: buyer.email,
    email: editData.email,
    firstName: editData.name.split(" ")[0],
    lastName: editData.name.split(" ")[1] || "",
    password: editData.password || null
  };

  const res = await fetch("/buyer_table/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    alert("Error updating account");
    return;
  }

  // Update UI with new data
  setBuyer({
    ...buyer,
    FName: editData.name.split(" ")[0],
    LName: editData.name.split(" ")[1] || "",
    email: editData.email
  });

  setShowEditModal(false);
};

 // -------------------------------------------
  // Checkout
  // -------------------------------------------

  async function handleCheckout() {
  const userEmail = localStorage.getItem("userEmail");

  const res = await fetch("http://localhost:5000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      buyerEmail: userEmail,
      cart: cart,   // the dictionary of items
      card: cardFormData  // from checkout modal
    })
  });

  const data = await res.json();

  if (data.success) {
    setCart({});
    alert("Order placed successfully!");
  } else {
    alert("Checkout failed.");
  }
}

  // -------------------------------------------
  // Logout
  // -------------------------------------------
  function handleLogout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    sessionStorage.clear();
    navigate("/");
  }


  if (!buyer) return <p>Loading dashboard...</p>;


  return (
    <div className="seller-content">

      <Navigation setSection={setSection} cartCount={cart.length} />

      {/* --------------------------- RECOMMENDED --------------------------- */}
      {section === "recommended" && (
        <div className="product-list">
          <h2>Recommended Products</h2>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search products..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* If searching, show results */}
          {searchQuery && (
            <div className="search-results">
              <h3>Search Results</h3>
              {searchResults.length === 0 && <p>No products found.</p>}
              {searchResults.map((p) => (
                <div key={p.ProductID} className="product-card">
                  <strong>{p.Name}</strong>
                  <p>${p.Price}</p>
                  <button className="button" onClick={() => addToCart(p)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Default recommended products */}
          {!searchQuery &&
            recommended.map((p) => (
              <div key={p.ProductID} className="product-card">
                <strong>{p.Name}</strong>
                <p>${p.Price}</p>
                <button className="button" onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            ))}
        </div>
      )}

      {/* --------------------------- ORDERS --------------------------- */}
      {section === "orders" && (
        <div className="order-history">
          <h2>My Orders</h2>

          {orders.length === 0 && <p>You have no orders.</p>}

          {orders.map((o) => (
            <div key={o.OrderID} className="order-card">
              <strong>{o.ProductName}</strong>
              <p>Order Date: {o.DateCreated}</p>
              <p>Status: {o.Status}</p>
              <p>Quantity: {o.Quantity}</p>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------- CART --------------------------- */}
      {section === "cart" && (
          <div className="product-list">
            <h2>My Cart</h2>

            {Object.keys(cart).length === 0 && <p>Your cart is empty.</p>}

            {Object.values(cart).map((item) => (
              <div key={item.ProductID} className="product-card">
                <strong>{item.Name}</strong>
                <p>${item.Price}</p>
                <p>Qty: {item.Quantity}</p>
              </div>
            ))}

            {Object.keys(cart).length > 0 && (
              <button
                className="button"
                style={{ marginTop: "20px", width: "200px" }}
                onClick={() => setShowCheckoutModal(true)}
              >
                Checkout
              </button>
            )}
          </div>
        )}
      
      

          {/* --------------------------- CHECKOUT --------------------------- */}
 
                {showCheckoutModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Checkout</h2>

                <p>Total: ${Object.keys(cart).reduce((sum, item) => sum + item.Price * item.Quantity, 0)}</p>

                <form>
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardFormData.credit_card_num}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, credit_card_num: e.target.value })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Card Type (Visa, etc)"
                    value={cardFormData.card_type}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, card_type: e.target.value })
                    }
                  />

                  <input
                    type="text"
                    placeholder="MM"
                    value={cardFormData.expire_month}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, expire_month: e.target.value })
                    }
                  />

                  <input
                    type="text"
                    placeholder="YYYY"
                    value={cardFormData.expire_year}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, expire_year: e.target.value })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Security Code"
                    value={cardFormData.security_code}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, security_code: e.target.value })
                    }
                  />

                  <button
                    type="button"
                    className="button"
                    onClick={handleCheckout}
                  >
                    Confirm Checkout
                  </button>

                  <button
                    type="button"
                    className="button"
                    style={{ backgroundColor: "gray", marginTop: "10px" }}
                    onClick={() => setShowCheckoutModal(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}


      {/* --------------------------- ACCOUNT --------------------------- */}
      {section === "account" && (
        <div className="product-list">
          <h2>Account Information</h2>

          <p><strong>Name:</strong> {buyer.FName} {buyer.LName}</p>
          <p><strong>Email:</strong> {buyer.email}</p>
          <p><strong>Member Since:</strong> {buyer.RegistrationDate}</p>

          <button
            className="button"
            style={{ marginTop: "20px" }}
            onClick={() => {
              setEditData({
                name: `${buyer.FName} ${buyer.LName}`,
                email: buyer.email,
                password: "",
              });
              setShowEditModal(true);
            }}
          >
            Edit Account
          </button>
        </div>
      )}

      {/* --------------------------- ACCOUNT EDIT MODAL --------------------------- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Account Information</h2>

            <form>
              <input
                type="text"
                placeholder="Full Name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email Address"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="New Password"
                value={editData.password}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
              />

              <button type="button" className="button" onClick={saveAccountChanges}>
                Save Changes
              </button>

              <button
                type="button"
                className="button"
                style={{ backgroundColor: "gray", marginTop: "10px" }}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------- HELP DESK BUTTON --------------------------- */}
      <div className="tooltip" style={{ position: "fixed", bottom: "20px", right: "20px" }}>
        <button
          className="button"
          style={{
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "1.5em",
          }}
          onClick={() => setShowTicketForm(true)}
        >
          ?
        </button>
        <span className="tooltip-text">Contact Helpdesk</span>
      </div>

      <Modal show={showTicketForm} onClose={() => setShowTicketForm(false)}>
        <CreateTicket onSubmit={() => setShowTicketForm(false)} />
      </Modal>

      {/* --------------------------- LOGOUT BUTTON --------------------------- */}
      <div className="tooltip tooltip-left" style={{ position: "fixed", bottom: "20px", left: "20px" }}>
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

      <DashboardSwitcher />
    </div>
  );
}

export default BuyerDashboard;
