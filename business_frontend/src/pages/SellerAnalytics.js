import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

export default function BusinessAnalytics() {
  const [productsPerBusiness, setProductsPerBusiness] = useState([]);
  const [revenuePerBusiness, setRevenuePerBusiness] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    fetch(`${API}/business_analytics/products_per_business`)
      .then(res => res.json())
      .then(setProductsPerBusiness);

    fetch(`${API}/business_analytics/revenue_per_business`)
      .then(res => res.json())
      .then(setRevenuePerBusiness);

    fetch(`${API}/business_analytics/monthly_revenue`)
      .then(res => res.json())
      .then(setMonthlyRevenue);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Nittany Business</h1>
        <p>Business Analytics Dashboard</p>
        <h2>
          <Link
            to="/helpdesk"
            className="text-blue-600 hover:underline font-medium"
          >
            Return to Help Desk Dashboard
          </Link>
        </h2>
      </header>

      {/* Products Per Business + Revenue Per Business + Monthly Revenue */}
      <div className="analytics-row">
        
        <section className="analytics-section">
          <h2>Products Per Business</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Business</th>
                <th>Product Count</th>
              </tr>
            </thead>
            <tbody>
              {productsPerBusiness.map(row => (
                <tr key={row.BusinessID}>
                  <td>{row.BusinessName}</td>
                  <td>{row.product_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="analytics-section">
          <h2>Revenue Per Business</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Business</th>
                <th>Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {revenuePerBusiness.map(row => (
                <tr key={row.BusinessID}>
                  <td>{row.BusinessName}</td>
                  <td>{row.revenue?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="analytics-section">
          <h2>Monthly Revenue Per Business</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Month</th>
                <th>Business</th>
                <th>Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.month}</td>
                  <td>{row.BusinessName}</td>
                  <td>{row.revenue?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>


      <footer className="App-footer">
        © {new Date().getFullYear()} Team Progress | Penn State
      </footer>
    </div>
  );
}
