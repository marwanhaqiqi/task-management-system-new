import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const AddTasklist = () => {
  const navigate = useNavigate();
  const { taskId } = useParams(); // <-- untuk cek mode edit
  const isEditMode = !!taskId;

  const [tasklist, setTasklist] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  // Fetch task data kalau edit
  const fetchTask = async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "GET",
        headers: getHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        const task = result.data;
        setTasklist(task.tasklist);
        setDescription(task.description);
        setDeadline(task.deadline);
        setStatus(task.status);
      } else {
        alert("Gagal mengambil data task");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      alert("Terjadi kesalahan");
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchTask();
    }
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = isEditMode ? "PUT" : "POST";
    const endpoint = isEditMode
      ? `${API_BASE_URL}/tasks/${taskId}`
      : `${API_BASE_URL}/tasks`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ tasklist, description, deadline, status }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Task berhasil ${isEditMode ? "diedit" : "ditambahkan"}!`);
        navigate("/dashboard");
      } else {
        alert("Gagal menyimpan task: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("Terjadi kesalahan saat menyimpan task");
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate(-1)}
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
              onClick={() => navigate(-1)}
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
