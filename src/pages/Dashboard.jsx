import { Ellipsis, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tasklist, setTasklist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000/api";

  const getToken = () => localStorage.getItem("token");

  const getUser = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchTasks = async (search = "") => {
    setLoading(true);
    try {
      const queryParam = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await axios.get(`${API_BASE_URL}/tasks${queryParam}`, {
        headers: getHeaders(),
      });

      const result = response.data;

      if (result.success) {
        setTasklist(result.data.data || result.data || []);
      } else {
        console.error("Failed to fetch tasks:", result.message);
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );

      const result = response.data;

      if (result.success) {
        setTasklist((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        alert("Failed to update status: " + result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus task ini?")) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: getHeaders(),
      });

      const result = response.data;

      if (result.success) {
        setTasklist((prevTasks) =>
          prevTasks.filter((task) => task.id !== taskId)
        );
        alert("Task berhasil dihapus");
      } else {
        alert("Failed to delete task: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, { headers: getHeaders() });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeUser("user");
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchTasks(value);
    }, 500);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Fungsi untuk menghitung waktu tersisa yang lebih akurat
  const calculateRemainingDays = (deadline) => {
    if (!deadline) return "Tanggal tidak valid";

    // Pastikan deadline diset ke akhir hari (23:59:59)
    const now = dayjs();
    const end = dayjs(deadline).endOf("day"); // Set ke 23:59:59

    if (!end.isValid()) return "Format tanggal tidak valid";

    const diffInMinutes = end.diff(now, "minute");
    const diffInHours = end.diff(now, "hour");
    const diffInDays = end.diff(now, "day");

    if (diffInMinutes < 0) {
      // Task sudah lewat deadline
      const pastMinutes = Math.abs(diffInMinutes);
      const pastHours = Math.abs(diffInHours);
      const pastDays = Math.abs(diffInDays);

      if (pastDays > 0) {
        const remainingHours = pastHours % 24;
        return remainingHours > 0
          ? `Terlambat ${pastDays} hari ${remainingHours} jam`
          : `Terlambat ${pastDays} hari`;
      } else if (pastHours > 0) {
        const remainingMinutes = pastMinutes % 60;
        return remainingMinutes > 0
          ? `Terlambat ${pastHours} jam ${remainingMinutes} menit`
          : `Terlambat ${pastHours} jam`;
      } else {
        return `Terlambat ${pastMinutes} menit`;
      }
    }

    // Task belum melewati deadline
    if (diffInDays > 0) {
      const remainingHours = diffInHours % 24;
      return remainingHours > 0
        ? `${diffInDays} hari ${remainingHours} jam lagi`
        : `${diffInDays} hari lagi`;
    } else {
      if (diffInHours > 0) {
        const remainingMinutes = diffInMinutes % 60;
        return remainingMinutes > 0
          ? `${diffInHours} jam ${remainingMinutes} menit lagi`
          : `${diffInHours} jam lagi`;
      } else {
        return diffInMinutes > 0
          ? `${diffInMinutes} menit lagi`
          : "Deadline hari ini";
      }
    }
  };

  // Fungsi untuk format deadline yang konsisten
  const formatDeadline = (deadline) => {
    if (!deadline) return "Tidak ada deadline";

    const date = dayjs(deadline);
    if (!date.isValid()) return "Format tanggal tidak valid";

    return date.format("DD/MM/YYYY");
  };

  // Fungsi untuk menentukan warna berdasarkan status waktu tersisa
  const getTimeRemainingColor = (deadline) => {
    if (!deadline) return "text-gray-500";

    const now = dayjs();
    const end = dayjs(deadline).endOf("day");
    const diffInHours = end.diff(now, "hour");

    if (diffInHours < 0) return "text-red-600"; // Terlambat
    if (diffInHours <= 24) return "text-orange-500"; // Kurang dari 1 hari
    if (diffInHours <= 72) return "text-yellow-500"; // Kurang dari 3 hari
    return "text-green-600"; // Masih aman
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll(".dropdown-menu");
      let clickedInside = false;

      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(event.target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();

    if (!token) {
      navigate("/login");
      return;
    }

    setUser(userData);
    fetchTasks();
  }, [navigate]);

  return (
    <div className="relative min-h-screen">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        src="/background.mp4"
        type="video/mp4"
      />
      <div className="relative z-0 transition-all">
        <nav className="px-5 py-4 flex justify-between items-center shadow-md">
          <section>
            <h1 className="font-medium text-xl mb-2">Task Management System</h1>
            <p>Halo {user?.name || "User"}</p>
          </section>
          <button
            type="button"
            onClick={handleLogout}
            className="flex gap-2.5 transition-all duration-200 hover:cursor-pointer hover:opacity-80 active:scale-80"
          >
            <LogOut />
            <p className="text-red-500">Keluar</p>
          </button>
        </nav>
        <main className="p-5">
          <section className="flex gap-3 justify-between items-end">
            <div className="w-full flex flex-col">
              <label htmlFor="cariData" className="mb-2 font-medium">
                Cari Data
              </label>
              <input
                id="cariData"
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Masukkan data yang kamu cari"
                className="w-full px-3 py-2 rounded-md ring-1 ring-gray-400 focus:outline-none"
              />
            </div>
            <Link to="/add">
              <button
                type="button"
                className="px-4 py-2 text-white bg-black whitespace-nowrap rounded-md transition-all duration-200 hover:cursor-pointer hover:opacity-80 active:scale-95"
              >
                Tambah Data
              </button>
            </Link>
          </section>

          {loading && (
            <div className="text-center py-4">
              <p>Loading...</p>
            </div>
          )}

          <table className="table-auto w-full mt-5">
            <thead className="border-b-1">
              <tr>
                <th className="px-6 py-3 text-left">No</th>
                <th className="px-6 py-3 text-left">Tasklist</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Deadline</th>
                <th className="px-6 py-3 text-left">Waktu Tersisa</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasklist.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    {searchTerm
                      ? "Tidak ada data yang ditemukan"
                      : "Belum ada task"}
                  </td>
                </tr>
              ) : (
                tasklist.map((task, index) => (
                  <tr key={task.id} className="relative text-left">
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3">{task.tasklist}</td>
                    <td className="px-6 py-3">{task.description}</td>
                    <td className="px-6 py-3">
                      {formatDeadline(task.deadline)}
                      <div className="text-xs text-gray-500">
                        (sampai 23:59)
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-sm font-medium ${getTimeRemainingColor(task.deadline)}`}
                      >
                        {calculateRemainingDays(task.deadline)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        className={`text-xs px-2 py-1 border rounded-md cursor-pointer bg-black ${
                          task.status === "pending"
                            ? "text-red-400"
                            : task.status === "in-progress"
                              ? "text-gray-400"
                              : "text-green-400"
                        }`}
                      >
                        <option className="text-red-400" value="pending">
                          Pending
                        </option>
                        <option className="text-gray-400" value="in-progress">
                          In-Progress
                        </option>
                        <option className="text-green-400" value="completed">
                          Completed
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-3 relative" ref={dropdownRef}>
                      <button
                        onClick={() => toggleDropdown(index)}
                        className="text-gray-600"
                      >
                        <Ellipsis className="transition-all duration-200 cursor-pointer active:scale-95" />
                      </button>
                      {openDropdown === index && (
                        <div className="dropdown-menu absolute right-0 mt-2 w-30 text-xs bg-black z-10 shadow-md rounded">
                          <Link
                            to={`/edit/${task.id}`}
                            className="block w-full text-left px-4 py-2 bg-white hover:bg-gray-300"
                          >
                            Edit Data
                          </Link>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-full text-left px-4 py-2 bg-white text-red-400 hover:bg-gray-300 cursor-pointer"
                          >
                            Hapus Data
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
