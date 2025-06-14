import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const AddTasklist = () => {
  const navigate = useNavigate();
  const { taskId } = useParams(); // Cek apakah mode edit
  const isEditMode = !!taskId;

  const [tasklist, setTasklist] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8000/api";
  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  // Fungsi untuk format tanggal dari backend ke format input date
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Format ke YYYY-MM-DD untuk input type="date"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Fungsi untuk format tanggal dari input ke format backend
  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;

    try {
      // Buat date object dengan timezone lokal dan set ke akhir hari
      const date = new Date(dateString + "T23:59:59.999");

      // Return dalam format ISO string atau sesuai kebutuhan backend
      return date.toISOString();
    } catch (error) {
      console.error("Error formatting date for backend:", error);
      return null;
    }
  };

  // Fetch data task saat mode edit
  const fetchTask = async () => {
    if (!taskId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: getHeaders(),
      });

      const result = response.data;

      if (result.success) {
        const task = result.data;
        setTasklist(task.tasklist || "");
        setDescription(task.description || "");
        setDeadline(formatDateForInput(task.deadline));
        setStatus(task.status || "pending");
      } else {
        alert("Gagal mengambil data task: " + result.message);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      alert("Terjadi kesalahan saat mengambil task");
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    // Cek authentication
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      fetchTask();
    }
  }, [taskId, isEditMode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi input
    if (!tasklist.trim()) {
      alert("Tasklist tidak boleh kosong");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      alert("Deskripsi tidak boleh kosong");
      setLoading(false);
      return;
    }

    if (!deadline) {
      alert("Deadline tidak boleh kosong");
      setLoading(false);
      return;
    }

    // Validasi deadline tidak boleh di masa lalu (kecuali saat edit)
    if (!isEditMode) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(deadline);

      if (selectedDate < today) {
        alert("Deadline tidak boleh di masa lalu");
        setLoading(false);
        return;
      }
    }

    const method = isEditMode ? "PUT" : "POST";
    const endpoint = isEditMode
      ? `${API_BASE_URL}/tasks/${taskId}`
      : `${API_BASE_URL}/tasks`;

    const requestData = {
      tasklist: tasklist.trim(),
      description: description.trim(),
      deadline: formatDateForBackend(deadline),
      status: status,
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Task berhasil ${isEditMode ? "diedit" : "ditambahkan"}!`);
        navigate("/dashboard");
      } else {
        alert("Gagal menyimpan task: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("Terjadi kesalahan saat menyimpan task");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[50]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        src="/background.mp4"
        type="video/mp4"
      />
      <div className="w-[438px] p-6 rounded-2xl shadow-lg opacity-100 relative z-30 bg-transparent">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditMode ? "Edit Tasklist" : "Tambah Tasklist"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-black cursor-pointer"
          >
            ✖
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="tasklist"
              className="block text-sm font-medium mb-1"
            >
              Tasklist
            </label>
            <input
              id="tasklist"
              type="text"
              value={tasklist}
              onChange={(e) => setTasklist(e.target.value)}
              placeholder="Masukkan judul tasklist"
              className="w-full p-2 border rounded-md focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi tasklist"
              rows="4"
              className="w-full rounded-md p-2 border focus:outline-none shadow-sm"
              required
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium mb-1"
            >
              Deadline
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md p-2 border focus:outline-none shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-2 py-1 border rounded-md bg-black ${
                status === "pending"
                  ? "text-red-400"
                  : status === "in-progress"
                    ? "text-gray-400"
                    : "text-green-400"
              }`}
            >
              <option className="text-red-400" value="pending">
                Pending
              </option>
              <option className="text-gray-400" value="in-progress">
                In Progress
              </option>
              <option className="text-green-400" value="completed">
                Completed
              </option>
            </select>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md border hover:opacity-80 transition-all duration-200 focus:scale-95 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-black rounded-md hover:opacity-80 transition-all duration-200 focus:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Tambah Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTasklist;
