import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTasklist from "./pages/AddTask";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add" element={<AddTasklist />} />
      <Route path="/edit/:taskId" element={<AddTasklist />} />
    </Routes>
  );
}

export default App;
