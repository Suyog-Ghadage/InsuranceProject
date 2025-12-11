import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import "../../pages/Admin/AdminProfile.css";
import {
  saveAdminProfile,
  updateAdminProfile,
  getAdminProfileByAdminId,
} from "../AdminAPI/AdminProfileAPI";

export default function AdminProfileForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("loading");
  const [profileId, setProfileId] = useState(null);
  const adminId = sessionStorage.getItem("adminId");
  const adminEmail = sessionStorage.getItem("adminEmail"); // 👈 Auto fill email
  const profileKey = `profileId_${adminId}`;

 
  const fieldIcons = {
    name: "👤",
    email: "📧",
    phoneNumber: "📱",
    dateOfBirth: "🎂",
    companyName: "🏢",
    companyType: "🏭",
    panNumber: "🧾",
    gstNumber: "💰",
    headOfficeAddress: "🏠",
    correspondenceAddress: "📮",
    permanentAddress: "📍",
    city: "🌆",
    state: "🗺️",
    country: "🌏",
    pinCode: "🔢",
  };

 const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters")
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address (e.g., abc@example.com)")
    .required("Email is required"),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),

  dateOfBirth: Yup.date()
  .required("Date of birth is required")
  .max(new Date(), "Date of birth cannot be in the future")
  .test(
    "age-limit",
    "Admin must be between 18 and 85 years old",
    function (value) {
      if (!value) return false;

      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // Adjust age if birth month/day hasn't occurred yet this year
      let adjustedAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        adjustedAge--;
      }

      return adjustedAge >= 18 && adjustedAge <= 85;
    }
  ),

  companyName: Yup.string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .required("Company name is required"),

  companyType: Yup.string()
    .trim()
    .min(2, "Company type must be at least 2 characters")
    .required("Company type is required"),

  panNumber: Yup.string()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
    .required("PAN number is required"),

  gstNumber: Yup.string()
    .trim()
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]Z[0-9A-Z]$/,
      "Invalid GST format (e.g., 27ABCDE1234F1Z5)"
    )
    .required("GST number is required"),

  headOfficeAddress: Yup.string()
    .trim()
    .required("Head office address is required"),

  correspondenceAddress: Yup.string()
    .trim()
    .required("Correspondence address is required"),

  permanentAddress: Yup.string()
    .trim()
    .required("Permanent address is required"),

  city: Yup.string()
  .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
  .trim()
  .required("City is required"),

state: Yup.string()
  .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
  .trim()
  .required("State is required"),

country: Yup.string()
  .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
  .trim()
  .required("Country is required"),

    pinCode: Yup.string()
    .trim()
    .required("PIN code is required")
    .matches(/^[1-9][0-9]{5}$/, "Invalid PIN code")
});
  const formik = useFormik({
    initialValues: {
      name: "",
      email: adminEmail || "", 
      phoneNumber: "",
      dateOfBirth: "",
      companyName: "",
      companyType: "",
      panNumber: "",
      gstNumber: "",
      headOfficeAddress: "",
      correspondenceAddress: "",
      permanentAddress: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!adminId) {
        alert("Admin not logged in!");
        return;
      }

      try {
        if (mode === "edit" && profileId) {
          await updateAdminProfile(profileId, values);
          alert("Profile Updated!");
        } else {
          const res = await saveAdminProfile(adminId, values);
          if (res.id) {
            sessionStorage.setItem(profileKey, res.id);
            setProfileId(res.id);
          }
          alert("Profile Created!");
        }
        fetchProfile();
      } catch (err) {
        console.error("Save error:", err);
        alert("Failed to save profile");
      }
    },
  });

  const fetchProfile = async () => {
    try {
      const data = await getAdminProfileByAdminId(adminId);
      if (data && data.id) {
        const { id, password, ...profileData } = data; // ❌ ignore password
        setProfileId(id);
        sessionStorage.setItem(profileKey, id);
        formik.setValues({ ...formik.initialValues, ...profileData });
        setMode("view");
      } else {
        setMode("create");
      }
    } catch {
      setMode("create");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [adminId]);

  if (mode === "loading") return <p>Loading...</p>;

  if (mode === "view")
    return (
      <div className="profile-overlay">
        <div className="form-container">
          <button className="close-btn" onClick={() => navigate("/admin/dashboard")}>
            ✖
          </button>
          <h2>Admin Profile</h2>
          <table className="profile-table">
            <tbody>
              {Object.entries(formik.values)
                .filter(([key]) => key !== "password") // ensure removed
                .map(([key, val]) => (
                  <tr key={key}>
                    <td>{fieldIcons[key]} {key.replace(/([A-Z])/g, " $1")}</td>
                    <td>{val}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button onClick={() => setMode("edit")} className="edit-btn blue-btn">
            ✎ Edit Profile
          </button>
        </div>
      </div>
    );

  return (
    <div className="profile-overlay">
      <div className="form-container">
        <button className="close-btn" onClick={() => navigate("/admin/dashboard")}>
          ✖
        </button>
        <h2>{mode === "edit" ? "Edit Admin Profile" : "Create Admin Profile"}</h2>

        <form onSubmit={formik.handleSubmit} className="form-grid">
          {Object.keys(formik.initialValues)
            .map((field) => (
              <div key={field} className="form-group">
                <label>
                  {fieldIcons[field]} {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type={field === "dateOfBirth" ? "date" : "text"}
                  {...formik.getFieldProps(field)}
                  readOnly={field === "email"} // 👈 Email non-editable
                />
                {formik.touched[field] && formik.errors[field] && (
                  <p className="error">{formik.errors[field]}</p>
                )}
              </div>
            ))}

          <div className="form-group full-width">
            <button type="submit" className="submit-btn">
              {mode === "edit" ? "Update Profile" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
