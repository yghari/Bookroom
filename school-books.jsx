import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEY = "school_books_app_v2";

const initialData = {
  students: [],
  books: [],
  payments: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialData;
  } catch {
    return initialData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const CLASSES = ["1ère", "2ème", "3ème", "4ème", "5ème", "6ème", "Bac1", "Bac2", "Terminal"];

function Badge({ children, color = "gray" }) {
  const colors = {
    green: { bg: "#d1fae5", text: "#065f46" },
    red: { bg: "#fee2e2", text: "#991b1b" },
    amber: { bg: "#fef3c7", text: "#92400e" },
    blue: { bg: "#dbeafe", text: "#1e40af" },
    gray: { bg: "#1f2937", text: "#9ca3af" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [tab, setTab] = useState("payment");
  const [toast, setToast] = useState(null);

  useEffect(() => { saveData(data); }, [data]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const mutate = useCallback((fn) => {
    setData(prev => {
      const next = fn(structuredClone(prev));
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const totalStudents = data.students.length;
    const totalReceived = data.payments.reduce((s, p) => s + p.amount, 0);
    const allDue = data.students.reduce((s, st) => {
      if (!st.books || !st.books.length) return s;
      return s + st.books.reduce((a, b) => {
        const book = data.books.find(bk => bk.id === b.bookId);
        return a + (book ? book.price * b.qty : 0);
      }, 0);
    }, 0);
    const totalRemaining = allDue - totalReceived;
    const lowStock = data.books.filter(b => b.qty <= 5).length;
    const paidStudents = data.students.filter(st => {
      const due = (st.books || []).reduce((a, b) => {
        const book = data.books.find(bk => bk.id === b.bookId);
        return a + (book ? book.price * b.qty : 0);
      }, 0);
      const paid = data.payments.filter(p => p.studentId === st.id).reduce((a, p) => a + p.amount, 0);
      return due > 0 && paid >= due;
    }).length;
    return { totalStudents, totalReceived, totalRemaining, lowStock, paidStudents };
  }, [data]);

  const tabs = [
    { id: "payment", label: "Payment", icon: "ti-credit-card" },
    { id: "students", label: "Students", icon: "ti-users" },
    { id: "books", label: "Books", icon: "ti-book" },
    { id: "dashboard", label: "Dashboard", icon: "ti-chart-bar" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1e293b; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input, select, textarea { background: #1e293b !important; border: 1px solid #334155 !important; color: #e2e8f0 !important; border-radius: 8px !important; padding: 8px 12px !important; font-size: 14px !important; font-family: inherit !important; outline: none !important; width: 100%; transition: border-color 0.15s; }
        input:focus, select:focus, textarea:focus { border-color: #6366f1 !important; }
        select option { background: #1e293b; }
        button { cursor: pointer; font-family: inherit; }
        .btn { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .btn:hover { background: #334155; border-color: #475569; }
        .btn-primary { background: #6366f1; border-color: #6366f1; color: #fff; }
        .btn-primary:hover { background: #4f46e5; border-color: #4f46e5; }
        .btn-danger { background: transparent; border-color: #ef4444; color: #ef4444; }
        .btn-danger:hover { background: #ef444420; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }
        .btn-success { background: #10b981; border-color: #10b981; color: #fff; }
        .btn-success:hover { background: #059669; }
        label { font-size: 12px; color: #94a3b8; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
        .form-row { display: grid; gap: 12px; margin-bottom: 12px; }
        .checkbox-custom { appearance: none; width: 16px !important; height: 16px; min-width: 16px; padding: 0 !important; border: 1.5px solid #475569 !important; border-radius: 4px !important; cursor: pointer; flex-shrink: 0; }
        .checkbox-custom:checked { background: #6366f1 !important; border-color: #6366f1 !important; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E"); background-size: cover; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "#6366f1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-books" style={{ fontSize: 20, color: "#fff" }} aria-hidden />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>BookRoom</h1>
              <p style={{ fontSize: 11, color: "#64748b" }}>School Book Management</p>
            </div>
          </div>
          {stats.lowStock > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef3c720", border: "1px solid #f59e0b40", borderRadius: 8, padding: "6px 12px" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: "#f59e0b" }} aria-hidden />
              <span style={{ fontSize: 12, color: "#f59e0b" }}>{stats.lowStock} low stock</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="btn" style={{
              borderColor: tab === t.id ? "#6366f1" : "#334155",
              background: tab === t.id ? "#6366f120" : "transparent",
              color: tab === t.id ? "#818cf8" : "#94a3b8",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 15 }} aria-hidden />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>{t.label}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 0 40px" }}>
          {tab === "payment" && <PaymentTab data={data} mutate={mutate} showToast={showToast} />}
          {tab === "students" && <StudentsTab data={data} mutate={mutate} showToast={showToast} />}
          {tab === "books" && <BooksTab data={data} mutate={mutate} showToast={showToast} />}
          {tab === "dashboard" && <DashboardTab data={data} stats={stats} />}
        </div>
      </div>
    </div>
  );
}

function PaymentTab({ data, mutate, showToast }) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [checkedBooks, setCheckedBooks] = useState({});

  const filteredStudents = useMemo(() =>
    data.students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase())
    ), [data.students, search]);

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setCheckedBooks({});
  };

  const studentBooks = useMemo(() => {
    if (!selectedStudent) return [];
    const cls = selectedStudent.class;
    return data.books.filter(b => b.class === cls);
  }, [selectedStudent, data.books]);

  const total = useMemo(() =>
    Object.entries(checkedBooks).reduce((s, [id, checked]) => {
      if (!checked) return s;
      const book = data.books.find(b => b.id === id);
      return s + (book ? book.price : 0);
    }, 0), [checkedBooks, data.books]);

  const studentPaid = useMemo(() => {
    if (!selectedStudent) return 0;
    return data.payments.filter(p => p.studentId === selectedStudent.id).reduce((s, p) => s + p.amount, 0);
  }, [selectedStudent, data.payments]);

  const processPayment = () => {
    if (total <= 0) return showToast("Select at least one book", "error");
    const selectedBookIds = Object.entries(checkedBooks).filter(([, v]) => v).map(([k]) => k);
    let outOfStock = null;
    for (const id of selectedBookIds) {
      const book = data.books.find(b => b.id === id);
      if (book && book.qty < 1) { outOfStock = book.title; break; }
    }
    if (outOfStock) return showToast(`"${outOfStock}" is out of stock`, "error");

    mutate(d => {
      selectedBookIds.forEach(id => {
        const book = d.books.find(b => b.id === id);
        if (book) book.qty = Math.max(0, book.qty - 1);
      });
      d.payments.push({
        id: Date.now().toString(),
        studentId: selectedStudent.id,
        amount: total,
        bookIds: selectedBookIds,
        date: new Date().toISOString(),
      });
      const student = d.students.find(s => s.id === selectedStudent.id);
      if (student) {
        if (!student.books) student.books = [];
        selectedBookIds.forEach(id => {
          const existing = student.books.find(b => b.bookId === id);
          if (existing) existing.qty = (existing.qty || 0) + 1;
          else student.books.push({ bookId: id, qty: 1 });
        });
      }
      return d;
    });
    showToast(`Payment of ${total.toFixed(2)} DH processed!`);
    setCheckedBooks({});
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      {/* Student search */}
      <div>
        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <label>Search student</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 15 }} aria-hidden />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or class…" style={{ paddingLeft: "32px !important" }} />
            </div>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredStudents.length === 0 && (
              <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No students found</p>
            )}
            {filteredStudents.map(s => {
              const paid = data.payments.filter(p => p.studentId === s.id).reduce((a, p) => a + p.amount, 0);
              const due = (s.books || []).reduce((a, b) => {
                const book = data.books.find(bk => bk.id === b.bookId);
                return a + (book ? book.price * b.qty : 0);
              }, 0);
              const isSelected = selectedStudent?.id === s.id;
              return (
                <div key={s.id} onClick={() => selectStudent(s)} style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${isSelected ? "#6366f1" : "#334155"}`,
                  background: isSelected ? "#6366f115" : "transparent",
                  transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#f1f5f9" }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: "#64748b" }}>{s.class}</p>
                    </div>
                    <Badge color={paid >= due && due > 0 ? "green" : paid > 0 ? "amber" : "gray"}>
                      {paid >= due && due > 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Book selection & payment */}
      <div>
        {!selectedStudent ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#475569" }}>
            <i className="ti ti-user-search" style={{ fontSize: 48, marginBottom: 12 }} aria-hidden />
            <p style={{ fontSize: 14 }}>Select a student to process payment</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>{selectedStudent.name}</h2>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Class: {selectedStudent.class} · Previously paid: {studentPaid.toFixed(2)} DH</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Books for {selectedStudent.class}</p>
              {studentBooks.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>No books configured for this class.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {studentBooks.map(book => (
                    <div key={book.id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      border: `1px solid ${checkedBooks[book.id] ? "#6366f1" : "#334155"}`,
                      borderRadius: 8, background: checkedBooks[book.id] ? "#6366f108" : "transparent",
                      transition: "all 0.15s", cursor: "pointer"
                    }} onClick={() => setCheckedBooks(prev => ({ ...prev, [book.id]: !prev[book.id] }))}>
                      <input type="checkbox" className="checkbox-custom" checked={!!checkedBooks[book.id]} onChange={() => {}} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, color: "#e2e8f0" }}>{book.title}</p>
                        <p style={{ fontSize: 11, color: "#64748b" }}>Stock: {book.qty}</p>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#818cf8", fontFamily: "'Space Grotesk', sans-serif" }}>{book.price.toFixed(2)} DH</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>Total to pay</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#6366f1" }}>{total.toFixed(2)} <span style={{ fontSize: 14 }}>DH</span></p>
              </div>
              <button className="btn btn-success" onClick={processPayment} style={{ padding: "10px 24px", fontSize: 14 }} disabled={total === 0}>
                <i className="ti ti-credit-card" style={{ marginRight: 6 }} aria-hidden />
                Process Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsTab({ data, mutate, showToast }) {
  const [form, setForm] = useState({ name: "", class: CLASSES[0] });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const addStudent = () => {
    if (!form.name.trim()) return showToast("Name is required", "error");
    mutate(d => {
      d.students.push({ id: Date.now().toString(), name: form.name.trim(), class: form.class, books: [], createdAt: new Date().toISOString() });
      return d;
    });
    setForm(f => ({ ...f, name: "" }));
    showToast("Student added");
  };

  const deleteStudent = (id) => {
    mutate(d => {
      d.students = d.students.filter(s => s.id !== id);
      d.payments = d.payments.filter(p => p.studentId !== id);
      return d;
    });
    showToast("Student deleted");
  };

  const enrichedStudents = useMemo(() =>
    data.students.map(s => {
      const due = (s.books || []).reduce((a, b) => {
        const book = data.books.find(bk => bk.id === b.bookId);
        return a + (book ? book.price * b.qty : 0);
      }, 0);
      const paid = data.payments.filter(p => p.studentId === s.id).reduce((a, p) => a + p.amount, 0);
      const status = due === 0 ? "none" : paid >= due ? "paid" : paid > 0 ? "partial" : "unpaid";
      return { ...s, due, paid, remaining: Math.max(0, due - paid), status };
    }), [data]);

  const filtered = enrichedStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.class.toLowerCase().includes(search.toLowerCase());
    if (filter === "paid") return matchSearch && s.status === "paid";
    if (filter === "partial") return matchSearch && s.status === "partial";
    if (filter === "unpaid") return matchSearch && (s.status === "unpaid" || s.status === "none");
    return matchSearch;
  });

  const exportXLSX = () => {
    const rows = enrichedStudents.map(s => ({
      Name: s.name, Class: s.class, "Total Due (DH)": s.due.toFixed(2),
      "Paid (DH)": s.paid.toFixed(2), "Remaining (DH)": s.remaining.toFixed(2), Status: s.status
    }));
    const ws = toCSV(rows);
    downloadFile(ws, "students.csv", "text/csv");
    showToast("Exported as CSV (open in Excel)");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Add Student</h3>
        <div className="form-row" style={{ gridTemplateColumns: "1fr 160px auto" }}>
          <div><label>Full name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" onKeyDown={e => e.key === "Enter" && addStudent()} /></div>
          <div><label>Class</label>
            <select value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-primary" onClick={addStudent}><i className="ti ti-plus" aria-hidden /> Add</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all", "All"], ["paid", "Paid"], ["partial", "Partial"], ["unpaid", "Unpaid"]].map(([val, label]) => (
              <button key={val} className="btn btn-sm" onClick={() => setFilter(val)} style={{
                borderColor: filter === val ? "#6366f1" : "#334155",
                background: filter === val ? "#6366f120" : "transparent",
                color: filter === val ? "#818cf8" : "#94a3b8"
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: 160 }} />
            <button className="btn btn-sm" onClick={exportXLSX}><i className="ti ti-file-spreadsheet" aria-hidden /> Export</button>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              {["Name", "Class", "Due", "Paid", "Remaining", "Status", ""].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "24px 10px", textAlign: "center", color: "#475569" }}>No students found</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "10px 10px", color: "#e2e8f0", fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{s.class}</td>
                <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{s.due.toFixed(2)}</td>
                <td style={{ padding: "10px 10px", color: "#10b981" }}>{s.paid.toFixed(2)}</td>
                <td style={{ padding: "10px 10px", color: s.remaining > 0 ? "#f59e0b" : "#64748b" }}>{s.remaining.toFixed(2)}</td>
                <td style={{ padding: "10px 10px" }}>
                  <Badge color={s.status === "paid" ? "green" : s.status === "partial" ? "amber" : s.status === "unpaid" ? "red" : "gray"}>
                    {s.status === "none" ? "—" : s.status}
                  </Badge>
                </td>
                <td style={{ padding: "10px 10px" }}>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s.id)}><i className="ti ti-trash" aria-hidden /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BooksTab({ data, mutate, showToast }) {
  const [form, setForm] = useState({ title: "", class: CLASSES[0], price: "", qty: "" });
  const [editId, setEditId] = useState(null);
  const [filterClass, setFilterClass] = useState("all");

  const save = () => {
    if (!form.title.trim()) return showToast("Title required", "error");
    if (!form.price || isNaN(+form.price) || +form.price < 0) return showToast("Valid price required", "error");
    if (!form.qty || isNaN(+form.qty) || +form.qty < 0) return showToast("Valid quantity required", "error");
    if (editId) {
      mutate(d => { const b = d.books.find(b => b.id === editId); if (b) { b.title = form.title.trim(); b.class = form.class; b.price = +form.price; b.qty = +form.qty; } return d; });
      setEditId(null);
      showToast("Book updated");
    } else {
      mutate(d => { d.books.push({ id: Date.now().toString(), title: form.title.trim(), class: form.class, price: +form.price, qty: +form.qty }); return d; });
      showToast("Book added");
    }
    setForm({ title: "", class: CLASSES[0], price: "", qty: "" });
  };

  const startEdit = (book) => {
    setEditId(book.id);
    setForm({ title: book.title, class: book.class, price: String(book.price), qty: String(book.qty) });
  };

  const deleteBook = (id) => {
    mutate(d => { d.books = d.books.filter(b => b.id !== id); return d; });
    showToast("Book deleted");
  };

  const filtered = filterClass === "all" ? data.books : data.books.filter(b => b.class === filterClass);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {editId ? "Edit Book" : "Add Book"}
        </h3>
        <div className="form-row" style={{ gridTemplateColumns: "1fr 140px 100px 100px auto" }}>
          <div><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Book title" /></div>
          <div><label>Class</label><select value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>{CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label>Price (DH)</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
          <div><label>Quantity</label><input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="0" /></div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <button className="btn btn-primary" onClick={save}>{editId ? "Update" : <><i className="ti ti-plus" aria-hidden /> Add</>}</button>
            {editId && <button className="btn" onClick={() => { setEditId(null); setForm({ title: "", class: CLASSES[0], price: "", qty: "" }); }}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <button className="btn btn-sm" onClick={() => setFilterClass("all")} style={{ borderColor: filterClass === "all" ? "#6366f1" : "#334155", background: filterClass === "all" ? "#6366f120" : "transparent", color: filterClass === "all" ? "#818cf8" : "#94a3b8" }}>All classes</button>
          {CLASSES.map(c => (
            <button key={c} className="btn btn-sm" onClick={() => setFilterClass(c)} style={{ borderColor: filterClass === c ? "#6366f1" : "#334155", background: filterClass === c ? "#6366f120" : "transparent", color: filterClass === c ? "#818cf8" : "#94a3b8" }}>{c}</button>
          ))}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              {["Title", "Class", "Price", "Stock", "Status", ""].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "24px 10px", textAlign: "center", color: "#475569" }}>No books found</td></tr>
            )}
            {filtered.map(book => (
              <tr key={book.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "10px 10px", color: "#e2e8f0", fontWeight: 500 }}>{book.title}</td>
                <td style={{ padding: "10px 10px" }}><Badge color="blue">{book.class}</Badge></td>
                <td style={{ padding: "10px 10px", color: "#818cf8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{book.price.toFixed(2)} DH</td>
                <td style={{ padding: "10px 10px", color: book.qty <= 5 ? "#f59e0b" : "#94a3b8", fontWeight: book.qty <= 5 ? 600 : 400 }}>{book.qty}</td>
                <td style={{ padding: "10px 10px" }}>
                  <Badge color={book.qty === 0 ? "red" : book.qty <= 5 ? "amber" : "green"}>
                    {book.qty === 0 ? "Out" : book.qty <= 5 ? "Low" : "OK"}
                  </Badge>
                </td>
                <td style={{ padding: "10px 10px", display: "flex", gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => startEdit(book)}><i className="ti ti-edit" aria-hidden /></button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteBook(book.id)}><i className="ti ti-trash" aria-hidden /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardTab({ data, stats }) {
  const exportAll = () => {
    const studentRows = data.students.map(s => {
      const paid = data.payments.filter(p => p.studentId === s.id).reduce((a, p) => a + p.amount, 0);
      const due = (s.books || []).reduce((a, b) => {
        const book = data.books.find(bk => bk.id === b.bookId);
        return a + (book ? book.price * b.qty : 0);
      }, 0);
      return { Name: s.name, Class: s.class, "Due (DH)": due.toFixed(2), "Paid (DH)": paid.toFixed(2), "Remaining (DH)": Math.max(0, due - paid).toFixed(2) };
    });
    const booksRows = data.books.map(b => ({ Title: b.title, Class: b.class, "Price (DH)": b.price.toFixed(2), Stock: b.qty }));
    let csv = "=== STUDENTS ===\n" + toCSV(studentRows) + "\n\n=== BOOKS ===\n" + toCSV(booksRows);
    downloadFile(csv, "school_books_export.csv", "text/csv");
  };

  const byClass = useMemo(() => {
    const map = {};
    data.students.forEach(s => {
      if (!map[s.class]) map[s.class] = { students: 0, paid: 0, remaining: 0 };
      map[s.class].students += 1;
      const paid = data.payments.filter(p => p.studentId === s.id).reduce((a, p) => a + p.amount, 0);
      const due = (s.books || []).reduce((a, b) => {
        const book = data.books.find(bk => bk.id === b.bookId);
        return a + (book ? book.price * b.qty : 0);
      }, 0);
      map[s.class].paid += paid;
      map[s.class].remaining += Math.max(0, due - paid);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const recentPayments = [...data.payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const metricCards = [
    { label: "Total students", value: stats.totalStudents, icon: "ti-users", color: "#818cf8" },
    { label: "Fully paid", value: stats.paidStudents, icon: "ti-circle-check", color: "#10b981" },
    { label: "Revenue (DH)", value: stats.totalReceived.toFixed(0), icon: "ti-coin", color: "#6366f1" },
    { label: "Outstanding (DH)", value: stats.totalRemaining.toFixed(0), icon: "ti-clock-exclamation", color: "#f59e0b" },
    { label: "Total books", value: data.books.length, icon: "ti-book", color: "#38bdf8" },
    { label: "Low stock alerts", value: stats.lowStock, icon: "ti-alert-triangle", color: "#ef4444" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn" onClick={exportAll}><i className="ti ti-file-spreadsheet" style={{ marginRight: 6 }} aria-hidden />Export all data (CSV)</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {metricCards.map(card => (
          <div key={card.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <i className={`ti ${card.icon}`} style={{ fontSize: 18, color: card.color }} aria-hidden />
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</span>
            </div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>By class</h3>
          {byClass.length === 0 ? <p style={{ color: "#475569", fontSize: 13 }}>No data yet</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "1px solid #334155" }}>
                {["Class", "Students", "Collected", "Remaining"].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}
              </tr></thead>
              <tbody>{byClass.map(([cls, info]) => (
                <tr key={cls} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "8px 8px" }}><Badge color="blue">{cls}</Badge></td>
                  <td style={{ padding: "8px 8px", color: "#e2e8f0" }}>{info.students}</td>
                  <td style={{ padding: "8px 8px", color: "#10b981" }}>{info.paid.toFixed(0)} DH</td>
                  <td style={{ padding: "8px 8px", color: info.remaining > 0 ? "#f59e0b" : "#64748b" }}>{info.remaining.toFixed(0)} DH</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent payments</h3>
          {recentPayments.length === 0 ? <p style={{ color: "#475569", fontSize: 13 }}>No payments yet</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentPayments.map(p => {
                const student = data.students.find(s => s.id === p.studentId);
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                    <div>
                      <p style={{ fontSize: 13, color: "#e2e8f0" }}>{student?.name || "Unknown"}</p>
                      <p style={{ fontSize: 11, color: "#64748b" }}>{new Date(p.date).toLocaleDateString()} · {student?.class}</p>
                    </div>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: "#10b981" }}>+{p.amount.toFixed(2)} DH</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {data.books.filter(b => b.qty <= 5).length > 0 && (
        <div className="card" style={{ border: "1px solid #f59e0b40" }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <i className="ti ti-alert-triangle" style={{ marginRight: 6 }} aria-hidden />Low stock books
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.books.filter(b => b.qty <= 5).map(b => (
              <div key={b.id} style={{ background: "#1e293b", border: "1px solid #f59e0b30", borderRadius: 8, padding: "8px 14px" }}>
                <p style={{ fontSize: 13, color: "#e2e8f0" }}>{b.title}</p>
                <p style={{ fontSize: 11, color: "#f59e0b" }}>{b.class} · {b.qty} left</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))];
  return lines.join("\n");
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
