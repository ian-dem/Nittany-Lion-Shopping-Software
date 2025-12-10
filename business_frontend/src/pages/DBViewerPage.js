import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DBViewerPage() {

  const [selected, setSelected] = useState("");
  const [tables, setTables] = useState([]);

  // list of available tables here.
  useEffect(() => {
    // with  GET /tables
    fetch("http://localhost:5000/api/tables")
      .then(res => res.json())
      .then(data => {
        if (data.tables) setTables(data.tables);
      })
      .catch(() => {});
  }, []);

  return (
    
    <div style={{ padding: "30px" }}>
        <Link 
        to="/helpdesk"
        className="text-blue-600 hover:underline font-medium">
        Return to Help Desk Dashboard
        </Link>
      <h1>Database Viewer</h1>

      {/* Dropdown */}
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select a table...</option>
        {tables.map((t) => (
          <option key={t.route} value={t.route}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Display table data */}
      {selected && <TableView routeName={selected} />}
    </div>
  );
}




function TableView({ routeName }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/${routeName}/`)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error("Fetch error:", err));
  }, [routeName]);

  // No rows? Show message
  if (!rows || rows.length === 0) {
    return <p style={{ marginTop: "20px" }}>No data found.</p>;
  }

  // Automatically derive columns from the first row
  const columns = Object.keys(rows[0]);

  return (
    <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


