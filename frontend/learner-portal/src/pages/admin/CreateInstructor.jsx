import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createInstructor } from "../../services/adminService";

function CreateInstructor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createInstructor(form);

      alert(
        "Instructor Created Successfully"
      );

      navigate("/admin");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data ||
          "Failed To Create Instructor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      min-h-screen
      bg-[#0F1226]
      flex
      items-center
      justify-center
      px-6
      "
    >
      <form
        onSubmit={handleSubmit}
        className="
        w-full
        max-w-2xl
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
        "
      >
        <h1
          className="
          text-4xl
          font-bold
          mb-8
          "
        >
          Create Instructor
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="
            w-full
            p-4
            rounded-xl
            bg-[#161A34]
            border
            border-white/10
            "
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className="
            w-full
            p-4
            rounded-xl
            bg-[#161A34]
            border
            border-white/10
            "
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="
            w-full
            p-4
            rounded-xl
            bg-[#161A34]
            border
            border-white/10
            "
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="
            w-full
            p-4
            rounded-xl
            bg-[#161A34]
            border
            border-white/10
            "
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
          mt-6
          w-full
          py-4
          rounded-xl
          bg-[#C98A3D]
          text-[#161A34]
          font-bold
          "
        >
          {loading
            ? "Creating..."
            : "Create Instructor"}
        </button>
      </form>
    </div>
  );
}

export default CreateInstructor;