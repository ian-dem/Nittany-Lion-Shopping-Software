import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RecordEditor() {
  const [mode, setMode] = useState("insert");
  const [tableRoute, setTableRoute] = useState("");   // used for CRUD URLs
  const [tableName, setTableName] = useState("");     // actual SQL table name
  const [tables, setTables] = useState([]);

  const [columns, setColumns] = useState([]);
  const [pkName, setPkName] = useState("");
  const [pkValue, setPkValue] = useState("");

  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");

  // Fetch table list
  useEffect(() => {
    fetch("http://localhost:5000/tables")
      .then(res => res.json())
      .then(data => {
        if (data?.tables) {
          setTables(data.tables);
        }
      })
      .catch(() => setStatus("Failed to load table list."));
  }, []);

  // Fetch columns when SQL table name updates
  useEffect(() => {
    if (!tableName) return;

    fetch(`http://localhost:5000/columns/${tableName}`)
      .then(res => res.json())
      .then(data => {
        if (data?.columns) {
          setColumns(data.columns);

          const pk = data.columns.find(c => Number(c.pk) === 1);
          setPkName(pk ? pk.name : "id");

          const initial = {};
          data.columns.forEach(col => (initial[col.name] = ""));
          setFormData(initial);
        }
      })
      .catch(() => setStatus("Could not load table schema."));
  }, [tableName]);

  const handleSelectTable = (route) => {
    setTableRoute(route);

    const t = tables.find(tbl => tbl.route === route);
    if (t) setTableName(t.label.replace(/ /g, "_")); 
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ensure clean primitive data
  const sanitize = (data) => {
    const clean = {};
    for (const key in data) {
      const v = data[key];
      clean[key] =
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        v === null
          ? v
          : String(v);
    }
    return clean;
  };

  const api = async (url, method = "GET", body = null) => {
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(sanitize(body)) : null,
      });
      return await res.json();
    } catch {
      return { error: "Network error" };
    }
  };

  const insertRecord = async () => {
    const result = await api(
      `http://localhost:5000/${tableRoute}`,
      "POST",
      formData
    );
    setStatus(result.error ? result.error : `Inserted successfully (ID: ${result.id})`);
  };

  const loadRecord = async () => {
    if (!pkValue) return setStatus("PK value required.");

    const result = await api(
      `http://localhost:5000/${tableRoute}/${pkValue}?pk_name=${pkName}`
    );

    if (result.error) setStatus(result.error);
    else {
      setFormData(sanitize(result));
      setStatus("");
    }
  };

  const updateRecord = async () => {
    if (!pkValue) return setStatus("PK value required.");

    const result = await api(
      `http://localhost:5000/${tableRoute}/${pkValue}?pk_name=${pkName}`,
      "PUT",
      formData
    );

    setStatus(result.error ? result.error : "Record updated successfully.");
  };

  const deleteRecord = async () => {
    if (!pkValue) return setStatus("PK value required.");

    const result = await api(
      `http://localhost:5000/${tableRoute}/${pkValue}?pk_name=${pkName}`,
      "DELETE"
    );

    setStatus(result.error ? result.error : "Record deleted successfully.");
  };

  return (
    <div style={{ padding: "30px" }}>
      <Link to="/helpdesk" className="text-blue-600 hover:underline font-medium">
        Return to Help Desk Dashboard
      </Link>

      <h1 style={{ marginTop: "20px" }}>Record Editor</h1>

      {/* Mode selection */}
      <div style={{ marginTop: "20px" }}>
        <select value={mode} onChange={e => setMode(e.target.value)} style={{ padding: "10px", width: "200px" }}>
          <option value="insert">Insert</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      {/* Table selection */}
      <div style={{ marginTop: "20px" }}>
        <select
          value={tableRoute}
          onChange={e => handleSelectTable(e.target.value)}
          style={{ padding: "10px", width: "300px" }}
        >
          <option value="">Select table</option>
          {tables.map(t => (
            <option key={t.route} value={t.route}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {(mode === "update" || mode === "delete") && (
        <div style={{ marginTop: "20px" }}>
          <input
            placeholder="Primary key value"
            value={pkValue}
            onChange={e => setPkValue(e.target.value)}
            style={{ padding: "10px", width: "200px", marginRight: "10px" }}
          />
          {mode === "update" && (
            <button onClick={loadRecord} style={{ padding: "10px 20px" }}>Load Record</button>
          )}
        </div>
      )}

      {mode !== "delete" && tableRoute && (
        <div style={{ marginTop: "30px" }}>
          <h3>{mode.charAt(0).toUpperCase() + mode.slice(1)} Fields</h3>
          {columns.map(col => (
            <div key={col.name} style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>{col.name}</label>
              <input
                value={formData[col.name] || ""}
                disabled={mode !== "insert" && Number(col.pk) === 1}
                onChange={e => handleChange(col.name, e.target.value)}
                style={{ padding: "8px", width: "250px" }}
              />
            </div>
          ))}
        </div>
      )}

      {mode === "insert" && <button onClick={insertRecord} style={{ padding: "10px 20px" }}>Insert Record</button>}
      {mode === "update" && <button onClick={updateRecord} style={{ padding: "10px 20px" }}>Update Record</button>}
      {mode === "delete" && (
        <button onClick={deleteRecord} style={{ padding: "10px 20px", backgroundColor: "red", color: "white", marginTop: "20px" }}>
          Delete Record
        </button>
      )}

      {status && <p style={{ marginTop: "25px", color: "green" }}>{status}</p>}
    </div>
  );
}
