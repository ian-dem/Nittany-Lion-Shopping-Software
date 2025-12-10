
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AnalyticsDashboard() {
  const [totalSold, setTotalSold] = useState([]);
  const [soldPerMonth, setSoldPerMonth] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

    useEffect(() => {
    fetch("http://localhost:5000/analytics/total_sold")
        .then(res => res.json())
        .then(setTotalSold);

    fetch("http://localhost:5000/analytics/sold_per_month")
        .then(res => res.json())
        .then(setSoldPerMonth);

    fetch("http://localhost:5000/analytics/revenue")
        .then(res => res.json())
        .then(setRevenue);

    fetch("http://localhost:5000/analytics/monthly_revenue")
        .then(res => res.json())
        .then(setMonthlyRevenue);
    }, []);

  return (
    <div className="App">
            <header className="App-header">
                <h1>Nittany Business</h1>
                <p>Product Analytics</p>
                <h2><Link 
                            to="/helpdesk"
                            className="text-blue-600 hover:underline font-medium">
                            Return to Help Desk Dashboard
                            </Link></h2>
            </header>

      <section>
        <h2>Total Units Sold Per Product</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Sold</th>
            </tr>
          </thead>
          <tbody>
            {totalSold.map(row => (
              <tr key={row.ProductID}>
                <td>{row.Name}</td>
                <td>{row.total_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Revenue Per Product</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>Revenue ($)</th>
            </tr>
          </thead>
          <tbody>
            {revenue.map(row => (
              <tr key={row.ProductID}>
                <td>{row.Name}</td>
                <td>{row.revenue?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Sales Per Month</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Month</th>
              <th>Product</th>
              <th>Units Sold</th>
            </tr>
          </thead>
          <tbody>
            {soldPerMonth.map((row, idx) => (
              <tr key={idx}>
                <td>{row.month}</td>
                <td>{row.Name}</td>
                <td>{row.units_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Monthly Revenue</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue ($)</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRevenue.map((row, idx) => (
              <tr key={idx}>
                <td>{row.month}</td>
                <td>{row.revenue?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

        <footer className="App-footer">
                © {new Date().getFullYear()} Team Progress | Penn State
        </footer>
    </div>


  );
}
