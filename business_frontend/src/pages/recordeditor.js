import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * RecordEditor — stable version
 * - Uses SQL table name (derived from label) for schema + CRUD endpoints
 * - Uses route only for display
 * - CRUD endpoints call /api/table/<SQL_TABLE_NAME>/...
 */

export default function RecordEditor() {
  const [mode, setMode] = useState("insert"); // insert | update | delete
  const [tableRoute, setTableRoute] = useState(""); // route used for display (e.g. "zipcode")
  const [tableName, setTableName] = useState("");   // SQL table name (e.g. "Zipcode_Info")
  const [tables, setTables] = useState([]);         // list of {label, route}

  const [columns, setColumns] = useState([]);
  const [pkName, setPkName] = useState("id");
  const [pkValue, setPkValue] = useState("");

  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");

  // load table list
  useEffect(() => {
    fetch("http://localhost:5000/api/tables")
      .then((r) => r.json())
      .then((data) => {
        if (data?.tables) setTables(data.tables);
        else setTables([]);
      })
      .catch((err) => {
        console.error("Failed to load tables:", err);
        setStatus("Failed to load table list.");
      });
  }, []);

  // when SQL table name changes -> load columns/schema
  useEffect(() => {
    if (!tableName) return;

    setStatus("Loading schema...");
    fetch(`http://localhost:5000/api/columns/${tableName}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.columns) {
          setColumns(data.columns);
          // find pk - allow pk field to be number or "1"/"0"
          const pk = data.columns.find((c) => Number(c.pk) === 1);
          setPkName(pk?.name || "id");

          // create empty form based on columns
          const initial = {};
          data.columns.forEach((col) => (initial[col.name] = ""));
          setFormData(initial);
          setStatus("");
        } else {
          setColumns([]);
          setStatus("Schema not found for selected table.");
        }
      })
      .catch((err) => {
        console.error("Schema load error:", err);
        setColumns([]);
        setStatus("Could not load table schema.");
      });
  }, [tableName]);

  // when user selects a table from dropdown
  const handleSelectTable = (route) => {
    setTableRoute(route);

    const t = tables.find((tbl) => tbl.route === route);
    if (!t) {
      setTableName("");
      return;
    }

    // derive SQL table name from label by replacing spaces with underscore
    // e.g. "Zipcode Info" -> "Zipcode_Info"
    // (adjust if your backend expects a different mapping)
    const derivedSqlName = t.label.replace(/\s+/g, "_");
    setTableName(derivedSqlName);
    setPkValue("");
    setStatus("");
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ensure payload contains only primitives
  const sanitize = (data) => {
    const clean = {};
    for (const k in data) {
      const v = data[k];
      if (
        v === null ||
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean"
      ) {
        clean[k] = v;
      } else {
        clean[k] = String(v);
      }
    }
    return clean;
  };

  // small helper for requests
  const apiRequest = async (url, method = "GET", body = null) => {
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(sanitize(body)) : null,
      });
      return await response.json();
    } catch (err) {
      console.error("API request failed:", err);
      return { error: "Network error" };
    }
  };

  // CRUD operations — NOTE: using tableName (SQL table) in every URL
  const insertRecord = async () => {
    if (!tableName) return setStatus("No table selected.");
    const res = await apiRequest(
      `http://localhost:5000/api/table/${tableName}`,
      "POST",
      formData
    );
    setStatus(res.error ? res.error : `Inserted (id: ${res.id ?? "n/a"})`);
  };

  const loadRecord = async () => {
    if (!tableName) return setStatus("No table selected.");
    if (!pkValue) return setStatus("Primary key value required.");

    const res = await apiRequest(
      `http://localhost:5000/api/table/${tableName}/${encodeURIComponent(
        pkValue
      )}?pk_name=${encodeURIComponent(pkName)}`,
      "GET"
    );

    if (res.error) setStatus(res.error);
    else {
      // server returns a row object — copy primitives into form
      const sanitized = sanitize(res);
      setFormData((prev) => {
        const next = { ...prev };
        // fill only known columns to avoid extra keys
        columns.forEach((c) => {
          next[c.name] = sanitized[c.name] ?? "";
        });
        return next;
      });
      setStatus("");
    }
  };

  const updateRecord = async () => {
    if (!tableName) return setStatus("No table selected.");
    if (!pkValue) return setStatus("Primary key value required.");

    const res = await apiRequest(
      `http://localhost:5000/api/table/${tableName}/${encodeURIComponent(
        pkValue
      )}?pk_name=${encodeURIComponent(pkName)}`,
      "PUT",
      formData
    );

    setStatus(res.error ? res.error : "Record updated successfully.");
  };

  const deleteRecord = async () => {
    if (!tableName) return setStatus("No table selected.");
    if (!pkValue) return setStatus("Primary key value required.");

    const res = await apiRequest(
      `http://localhost:5000/api/table/${tableName}/${encodeURIComponent(
        pkValue
      )}?pk_name=${encodeURIComponent(pkName)}`,
      "DELETE"
    );

    setStatus(res.error ? res.error : "Record deleted successfully.");
  };

  // render inputs for each column
  const renderFields = () => {
    if (!columns || !columns.length) return null;

    return columns.map((col) => (
      <div key={col.name} style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 10 }}>{col.name}:</label>
        <input
          value={formData[col.name] ?? ""}
          disabled={mode !== "insert" && Number(col.pk) === 1}
          onChange={(e) => handleChange(col.name, e.target.value)}
          style={{ padding: 8, width: 300 }}
        />
      </div>
    ));
  };

  return (
    <div style={{ padding: 30 }}>
      <Link to="/helpdesk" className="text-blue-600 hover:underline font-medium">
        Return to Help Desk Dashboard
      </Link>

      <h1 style={{ marginTop: 20 }}>Record Editor</h1>

      <div style={{ marginTop: 20 }}>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ padding: 10, width: 200 }}
        >
          <option value="insert">Insert</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        <select
          value={tableRoute}
          onChange={(e) => handleSelectTable(e.target.value)}
          style={{ padding: 10, width: 300 }}
        >
          <option value="">Select table</option>
          {tables.map((t) => (
            <option key={t.route} value={t.route}>
              {t.label}
            </option>
          ))}
        </select>
        <div style={{ marginTop: 6, color: "#555" }}>
          {tableName ? `Using SQL table: ${tableName}` : null}
        </div>
      </div>

      {(mode === "update" || mode === "delete") && (
        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Primary key value"
            value={pkValue}
            onChange={(e) => setPkValue(e.target.value)}
            style={{ padding: 10, width: 200, marginRight: 10 }}
          />
          {mode === "update" && (
            <button onClick={loadRecord} style={{ padding: "10px 20px" }}>
              Load Record
            </button>
          )}
        </div>
      )}

      {mode !== "delete" && tableName && (
        <div style={{ marginTop: 30 }}>
          <h3>{mode.charAt(0).toUpperCase() + mode.slice(1)} Fields</h3>
          {renderFields()}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {mode === "insert" && (
          <button onClick={insertRecord} style={{ padding: "10px 20px" }}>
            Insert Record
          </button>
        )}
        {mode === "update" && (
          <button onClick={updateRecord} style={{ padding: "10px 20px" }}>
            Update Record
          </button>
        )}
        {mode === "delete" && (
          <button
            onClick={deleteRecord}
            style={{
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              marginTop: 10,
            }}
          >
            Delete Record
          </button>
        )}
      </div>

      {status && <p style={{ marginTop: 25, color: "green" }}>{status}</p>}
    </div>
  );
}
