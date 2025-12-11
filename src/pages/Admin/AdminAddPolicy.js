import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createPolicyPlan, updatePolicyPlan } from "../AdminAPI/AdminPolicyPlanAPI.js";
import "../Admin/AdminPolicy.css";

const capitalizeLabel = (text) =>
  text.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();

// Validation Schema
const validationSchema = Yup.object({
  policyName: Yup.string()
    .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
    .min(3, "Policy Name must be at least 3 characters")
    .required("Policy Name is required"),

  policyType: Yup.string()
    .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
    .min(3, "Policy Type must be at least 3 characters")
    .required("Policy Type is required"),

 coverage: Yup.number()
  .typeError("Coverage must be a number")
  .positive("Coverage must be greater than 0")
  .min(10000, "Minimum coverage ₹10,000")
  .max(1000000000, "Maximum coverage ₹10,00,00,000") // <-- Added
  .required("Coverage is required"),

premium: Yup.number()
  .typeError("Premium must be a number")
  .positive("Premium must be greater than 0")
  .min(100, "Minimum premium ₹100")
  .max(100000000, "Maximum premium ₹1,00,00,000") // <-- Added
  .required("Premium is required"),


  durationInYears: Yup.number()
    .typeError("Duration must be a number")
    .integer("Duration must be whole number")
    .positive("Duration must be greater than 0")
    .max(50, "Max duration 50 years")
    .required("Duration is required"),

  image: Yup.mixed()
    .required("Policy Image is required")
    .test("fileSize", "Max file size 2MB", (file) =>
      file ? file.size <= 2 * 1024 * 1024 : false
    )
    .test("fileType", "Only JPG/PNG allowed", (file) =>
      file ? ["image/jpeg", "image/png"].includes(file.type) : false
    ),
});

export default function AdminAddPolicy() {
  const adminId = sessionStorage.getItem("adminId");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const formik = useFormik({
    initialValues: {
      policyName: "",
      policyType: "",
      coverage: "",
      premium: "",
      durationInYears: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append(
          "policy",
          JSON.stringify({
            policyName: values.policyName,
            policyType: values.policyType,
            coverage: values.coverage,
            premium: values.premium,
            durationInYears: values.durationInYears,
          })
        );
        formData.append("image", values.image);

        if (editMode) {
          await updatePolicyPlan(adminId, editId, formData);
          alert("Policy Updated Successfully!");
        } else {
          await createPolicyPlan(adminId, formData);
          alert("Policy Added Successfully!");
        }

        resetForm();
        setEditMode(false);
        setEditId(null);
        window.location.href = "/admin/dashboard/view-policies";

      } catch (err) {
        console.error("Error:", err);
        alert("Failed to save policy plan.");
      }
    },
  });

  // Load Update Data if Editing
  useEffect(() => {
    const stored = sessionStorage.getItem("editPolicy");
    if (stored) {
      const policy = JSON.parse(stored);
      formik.setValues({
        policyName: policy.policyName,
        policyType: policy.policyType,
        coverage: policy.coverage,
        premium: policy.premium,
        durationInYears: policy.durationInYears,
        image: null,
      });
      setEditMode(true);
      setEditId(policy.id);
      sessionStorage.removeItem("editPolicy");
    }
  }, []);

  return (
    <div className="form-container">
      <h2 className="form-title">
        {editMode ? "✏️ Edit Policy Plan" : "➕ Add Policy Plan"}
      </h2>

      <form onSubmit={formik.handleSubmit} className="form-grid">
        {/* Name & Type Fields with Live Input Restriction */}
        {["policyName", "policyType"].map((field) => (
          <div key={field} className="form-group">
            <label>{capitalizeLabel(field)}</label>
            <input
              type="text"
              {...formik.getFieldProps(field)}
              onInput={(e) => {
                const cleanValue = e.target.value.replace(/[^A-Za-z ]/g, "");
                formik.setFieldValue(field, cleanValue);
              }}
              className={formik.errors[field] && formik.touched[field] ? "error-input" : ""}
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className="error"> {formik.errors[field]}</p>
            )}
          </div>
        ))}

        {/* Numeric Fields */}
        {["coverage", "premium", "durationInYears"].map((field) => (
          <div key={field} className="form-group">
            <label>{capitalizeLabel(field)}</label>
            <input
              type="number"
              {...formik.getFieldProps(field)}
              className={formik.errors[field] && formik.touched[field] ? "error-input" : ""}
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className="error"> {formik.errors[field]}</p>
            )}
          </div>
        ))}

        {/* Image Upload */}
        <div className="form-group full-width">
          <label>Policy Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              formik.setFieldValue("image", e.target.files[0]);
              formik.setFieldTouched("image", true);
            }}
            className={formik.errors.image && formik.touched.image ? "error-input" : ""}
          />
          {formik.touched.image && formik.errors.image && (
            <p className="error"> {formik.errors.image}</p>
          )}
        </div>

        <div className="form-group full-width">
          <button type="submit" className="submit-btn">
            {editMode ? "Update Policy" : "Save Policy"}
          </button>
        </div>
      </form>
    </div>
  );
}
