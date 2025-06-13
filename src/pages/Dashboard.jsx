import { Ellipsis, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tasklist, setTasklist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // API Base URL
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Get user from localStorage
  const getUser = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  // API Headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  // Fetch Tasks from API
  const fetchTasks = async (search = "") => {
    setLoading(true);
    try {
      const queryParam = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await fetch(`${API_BASE_URL}/tasks${queryParam}`, {
        method: "GET",
        headers: getHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        setTasklist(result.data.data || result.data || []); // Handle pagination
      } else {
        console.error("Failed to fetch tasks:", result.message);
        // If unauthorized, redirect to login
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Status Change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
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

  // Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus task ini?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
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

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: getHeaders(),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login
      navigate("/login");
    }
  };

  // Handle Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchTasks(value);
    }, 500);
  };

  // Toggle Dropdown
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Click outside to close dropdown
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

  // Initial load
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

  const calculateRemainingDays = (deadline) => {
    if (!deadline) return "Tanggal tidak valid";

    const now = dayjs();
    const end = dayjs(deadline);

    if (!end.isValid()) return "Format tanggal tidak valid";

    const diffInMinutes = end.diff(now, "minute");
    const diffInHours = end.diff(now, "hour");
    const diffInDays = end.diff(now, "day");

    // Jika sudah lewat
    if (diffInMinutes < 0) {
      const pastMinutes = Math.abs(diffInMinutes);
      const pastHours = Math.abs(diffInHours);
      const pastDays = Math.abs(diffInDays);

      if (pastDays > 0) {
        const remainingHours = pastHours % 24;
        if (remainingHours > 0) {
          return `Sudah lewat ${pastDays} hari ${remainingHours} jam`;
        }
        return `Sudah lewat ${pastDays} hari`;
      } else if (pastHours > 0) {
        const remainingMinutes = pastMinutes % 60;
        if (remainingMinutes > 0) {
          return `Sudah lewat ${pastHours} jam ${remainingMinutes} menit`;
        }
        return `Sudah lewat ${pastHours} jam`;
      } else {
        return `Sudah lewat ${pastMinutes} menit`;
      }
    }

    // Jika masih akan datang
    if (diffInDays > 0) {
      const remainingHours = diffInHours % 24;
      if (remainingHours > 0) {
        return `${diffInDays} hari ${remainingHours} jam lagi`;
      }
      return `${diffInDays} hari lagi`;
    } else {
      // Hari ini
      if (diffInHours > 0) {
        const remainingMinutes = diffInMinutes % 60;
        if (remainingMinutes > 0) {
          return `${diffInHours} jam ${remainingMinutes} menit lagi`;
        }
        return `${diffInHours} jam lagi`;
      } else {
        return `${diffInMinutes} menit lagi`;
      }
    }
  };

  // Format remaining days dari API atau hitung sendiri dengan detail jam
  const formatRemainingDays = (task) => {
    if (task.remaining_days !== undefined && task.remaining_days !== null) {
      // Jika API memberikan data dalam format number (dalam hari)
      if (typeof task.remaining_days === "number") {
        // Hitung ulang berdasarkan deadline sampai 23:59
        const now = dayjs();
        const end = dayjs(task.deadline).hour(23).minute(59).second(59);
        const diffInMinutes = end.diff(now, "minute");
        const diffInHours = end.diff(now, "hour");
        const diffInDays = end.diff(now, "day");

        if (diffInMinutes < 0) {
          const pastMinutes = Math.abs(diffInMinutes);
          const pastHours = Math.abs(diffInHours);
          const pastDays = Math.abs(diffInDays);

          if (pastDays > 0) {
            const remainingHours = pastHours % 24;
            return remainingHours > 0
              ? `Sudah lewat ${pastDays} hari ${remainingHours} jam`
              : `Sudah lewat ${pastDays} hari`;
          } else if (pastHours > 0) {
            const remainingMinutes = pastMinutes % 60;
            return remainingMinutes > 0
              ? `Sudah lewat ${pastHours} jam ${remainingMinutes} menit`
              : `Sudah lewat ${pastHours} jam`;
          } else {
            return `Sudah lewat ${pastMinutes} menit`;
          }
        }

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
            return `${diffInMinutes} menit lagi`;
          }
        }
      }

      // Jika API memberikan data dalam format string
      if (typeof task.remaining_days === "string") {
        // Cek apakah sudah dalam format yang detail
        if (
          task.remaining_days.includes("jam") ||
          task.remaining_days.includes("menit")
        ) {
          return task.remaining_days;
        }

        // Coba parse sebagai number dan hitung ulang dengan deadline 23:59
        const parsed = parseFloat(task.remaining_days);
        if (!isNaN(parsed)) {
          const now = dayjs();
          const end = dayjs(task.deadline).hour(23).minute(59).second(59);
          const diffInMinutes = end.diff(now, "minute");
          const diffInHours = end.diff(now, "hour");
          const diffInDays = end.diff(now, "day");

          if (diffInMinutes < 0) {
            const pastMinutes = Math.abs(diffInMinutes);
            const pastHours = Math.abs(diffInHours);
            const pastDays = Math.abs(diffInDays);

            if (pastDays > 0) {
              const remainingHours = pastHours % 24;
              return remainingHours > 0
                ? `Sudah lewat ${pastDays} hari ${remainingHours} jam`
                : `Sudah lewat ${pastDays} hari`;
            } else if (pastHours > 0) {
              const remainingMinutes = pastMinutes % 60;
              return remainingMinutes > 0
                ? `Sudah lewat ${pastHours} jam ${remainingMinutes} menit`
                : `Sudah lewat ${pastHours} jam`;
            } else {
              return `Sudah lewat ${pastMinutes} menit`;
            }
          }

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
              return `${diffInMinutes} menit lagi`;
            }
          }
        }
      }
    }

    // Fallback ke perhitungan manual dengan deadline 23:59
    return calculateRemainingDays(task.deadline);
  };

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
                      {dayjs(task.deadline).format("DD/MM/YYYY")}
                      <div className="text-xs">(sampai 23:59)</div>
                    </td>
                    {/* <td className="px-6 py-3">
                      {calculateRemainingDays(task.deadline)}
                    </td> */}
                    <td className="px-6 py-3">
                      {/* {task.remaining_days
                        ? `${Math.floor(parseFloat(task.remaining_days))} hari lagi`
                        : calculateRemainingDays(task.deadline)} */}
                      {/* {formatRemainingDays(task)} */}
                      <span className="text-sm">
                        {formatRemainingDays(task)}
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
