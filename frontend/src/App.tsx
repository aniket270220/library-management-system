import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, PlusCircle, Search, CheckCircle, RotateCcw, Trash2, Library } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  is_issued: boolean;
  issued_to: string | null;
}

const API_BASE = "http://127.0.0.1:8000/api";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Computer Science");
  const [studentName, setStudentName] = useState("");
  const [activeIssueId, setActiveIssueId] = useState<number | null>(null);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;
    try {
      await axios.post(`${API_BASE}/books`, {
        title: newTitle,
        author: newAuthor,
        category: newCategory
      });
      setNewTitle("");
      setNewAuthor("");
      fetchBooks();
    } catch (err) {
      alert("Failed to add book");
    }
  };

  const handleIssue = async (id: number) => {
    if (!studentName.trim()) {
      alert("Please enter a student name");
      return;
    }
    try {
      await axios.post(`${API_BASE}/books/${id}/issue`, { student_name: studentName });
      setStudentName("");
      setActiveIssueId(null);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Issue failed");
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/books/${id}/return`);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Return failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`${API_BASE}/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalBooks = books.length;
  const issuedCount = books.filter(b => b.is_issued).length;
  const availableCount = totalBooks - issuedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Library className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            NextGen Library Portal
          </h1>
        </div>
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalogue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-sm rounded-full pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-400"
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Stats & Add Book Form */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{totalBooks}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Available</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{availableCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Issued</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{issuedCount}</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200">
              <PlusCircle className="w-5 h-5 text-indigo-400" /> Add Book Entry
            </h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Author</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert C. Martin"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Electronics">Electronics</option>
                  <option value="General Science">General Science</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Add to Catalogue
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Books Table */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Book Inventory
          </h2>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-xs">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-slate-800/50">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No books found. Add one on the left to start!
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono">#{book.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-100">{book.title}</td>
                      <td className="py-3 px-4 text-slate-400">{book.author}</td>
                      <td className="py-3 px-4">
                        {book.is_issued ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Issued to {book.issued_to}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {book.is_issued ? (
                          <button
                            onClick={() => handleReturn(book.id)}
                            className="inline-flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700 transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Return
                          </button>
                        ) : activeIssueId === book.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Student Name"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs w-28 focus:outline-none focus:border-indigo-500 text-white"
                            />
                            <button
                              onClick={() => handleIssue(book.id)}
                              className="text-xs bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded text-white cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setActiveIssueId(null)}
                              className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveIssueId(book.id)}
                            className="inline-flex items-center text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-md border border-emerald-500/30 transition cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Issue
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                          title="Delete book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}