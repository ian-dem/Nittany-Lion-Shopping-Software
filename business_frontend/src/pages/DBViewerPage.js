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
  const PAGE_SIZE = 50;

  const [allRows, setAllRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [page, setPage] = useState(1);

  // Fetch full table
  useEffect(() => {
    setPage(1); // reset pagination

    fetch(`http://localhost:5000/${routeName}/`)
      .then((res) => res.json())
      .then((data) => {
        setAllRows(data || []);

        if (data && data.length > 0) {
          const cols = Object.keys(data[0]);
          setColumns(cols);
          setSearchField(cols[0]);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [routeName]);

  // --- SEARCH + FILTER ---
  const filteredRows = allRows.filter(row => {
    if (!searchValue.trim()) return true;

    const fieldVal = row[searchField];
    if (fieldVal === undefined || fieldVal === null) return false;

    return String(fieldVal).toLowerCase().includes(
      searchValue.toLowerCase()
    );
  });

  // --- PAGINATION ---
  const pageCount = Math.ceil(filteredRows.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visibleRows = filteredRows.slice(start, start + PAGE_SIZE);

  return (
    <div style={{ marginTop: "20px" }}>

      {/* --- SEARCH BAR --- */}
      {columns.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <select
            value={searchField}
            onChange={(e) => {
              setSearchField(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px", marginRight: "10px" }}
          >
            {columns.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px", width: "200px" }}
          />
        </div>
      )}

      {/* --- TABLE --- */}
      {visibleRows.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- PAGINATION --- */}
      {pageCount > 1 && (
        <div style={{ marginTop: "20px" }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{ padding: "8px", marginRight: "10px" }}
          >
            Prev
          </button>

          <span>Page {page} / {pageCount}</span>

          <button
            disabled={page === pageCount}
            onClick={() => setPage(page + 1)}
            style={{ padding: "8px", marginLeft: "10px" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}



