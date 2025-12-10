import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function ProductsListPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
    fetch("http://localhost:5000/api/products/")
         .then((res) => res.json())
         .then((data) => setProducts(data))
        .catch((err) => console.error("Error fetching products:", err));
     }, []);

    const filteredProducts = products.filter((p) =>
        p.Name.toLowerCase().includes(search.toLowerCase())
    );


    return (
        <div className="App">
            <header className="App-header">
                <h1>Nittany Business</h1>
                <p>Products List</p>
            </header>

            <main>

                <div className="min-h-screen bg-slate-100 p-10">
                    <h1 className="text-3xl font-semibold mb-6">Products</h1>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="p-2 mb-4 border rounded w-full max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* Table Container */}
                    <div className="bg-white p-6 shadow rounded-xl">
                        <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-100">
                            <th className="text-left p-3">ProductID</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Description</th>
                            <th className="text-left p-3">Quantity</th>
                            <th className="text-left p-3">TagID </th>
                            <th className="text-left p-3">CategoryID</th>
                            <th className="text-left p-3">Price</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{product.ProductID}</td>
                                <td className="p-3">{product.Name}</td>
                                <td className="p-3">${product.Description}</td>
                                <td className="p-3">{product.Quantity}</td>
                                <td className="p-3">{product.TagID}</td>
                                <td className="p-3">${product.CategoryID}</td>
                                <td className="p-3">${product.Price}</td>
                            </tr>
                            ))}

                            {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-3 text-center text-gray-500">
                                No products found.
                                </td>
                            </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <footer className="App-footer">
                © {new Date().getFullYear()} Team Progress | Penn State
            </footer>
        </div>
    );
}
