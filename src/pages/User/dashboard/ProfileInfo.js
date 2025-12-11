import { useEffect, useState } from 'react';
import './ProfileInfo.css';
import {
  fetchUserProfileApi,
  saveUserProfileApi,
  updateUserProfileApi,
} from '../../../api/user/profileApi';

import {
  FaUser, FaPhone, FaBirthdayCake, FaTransgender,
  FaHome, FaBriefcase, FaTint, FaIdCard, FaHeart, FaAddressCard
} from 'react-icons/fa';

export default function ProfileInfo() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    dob: '',
    gender: '',
    correspondenceAddress: '',
    permanentAddress: '',
    maritalStatus: '',
    occupation: '',
    bloodGroup: '',
    emergencyContact: '',
    aadhaarNumber: '',
  });

  const [isEditing, setIsEditing] = useState(true);
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [sameAddress, setSameAddress] = useState(false);

  const genderOptions = ["Male", "Female", "Other"];
  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem('authData') || '{}');
    if (!authData.userId || !authData.token) return;

    setUserId(authData.userId);
    fetchUserProfile(authData.userId, authData.token);
  }, []);

  const fetchUserProfile = async (userId, token) => {
    try {
      const data = await fetchUserProfileApi(userId, token);
      if (data) {
        setFormData(data);
        setIsEditing(false);
        sessionStorage.setItem('userProfileId', data.id);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.warn('Could not fetch profile, showing empty form');
      setIsEditing(true);
      setFormData({
        id: '',
        name: '',
        phone: '',
        dob: '',
        gender: '',
        correspondenceAddress: '',
        permanentAddress: '',
        maritalStatus: '',
        occupation: '',
        bloodGroup: '',
        emergencyContact: '',
        aadhaarNumber: '',
      });
    }
  };

  // --- Input handling ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const newErrors = { ...errors };
    switch (name) {
      case 'name':
        if (!value.trim()) newErrors.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(value)) newErrors.name = 'Name must contain letters only';
        else delete newErrors.name;
        break;

      case "dob":
        if (!value) {
          newErrors.dob = "Date of birth is required";
        } else {
          const selected = new Date(value);
          const today = new Date();

          if (selected > today) {
            newErrors.dob = "DOB cannot be in the future";
          } else {
            const age = today.getFullYear() - selected.getFullYear();
            const monthDiff = today.getMonth() - selected.getMonth();
            const dayDiff = today.getDate() - selected.getDate();

            const actualAge =
              monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)
                ? age
                : age - 1;

            if (actualAge < 18) {
              newErrors.dob = "You must be at least 18 years old";
            }
            else if (actualAge > 90) {
              newErrors.dob = "Age cannot be more than 90 years";
            }
            else delete newErrors.dob;
          }
        }
        break;

      case 'phone':
        if (!value.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^[6-9]\d{0,9}$/.test(value)) newErrors.phone = 'Invalid 10-digit phone number';
        else if (value.length < 10) newErrors.phone = 'Phone number must be 10 digits';
        else delete newErrors.phone;
        break;

      case 'emergencyContact':
        if (value && !/^[6-9]\d{0,9}$/.test(value)) newErrors.emergencyContact = 'Invalid 10-digit number';
        else if (value.length > 0 && value.length < 10) newErrors.emergencyContact = 'Phone number must be 10 digits';
        else delete newErrors.emergencyContact;
        break;

      case 'aadhaarNumber':
        const aadhaarValue = value.replace(/\s/g, '');
        if (!aadhaarValue) newErrors.aadhaarNumber = 'Aadhaar is required';
        else if (!/^[2-9]\d{11}$/.test(aadhaarValue)) newErrors.aadhaarNumber = 'Invalid Aadhaar number';
        else delete newErrors.aadhaarNumber;
        break;

      // ⭐ NEW VALIDATION: OCCUPATION
      case 'occupation':
        if (!value.trim()) newErrors.occupation = 'Occupation is required';
        else if (!/^[A-Za-z\s]+$/.test(value))
          newErrors.occupation = 'Occupation must contain letters only';
        else delete newErrors.occupation;
        break;

      default:
        if (!value.trim()) newErrors[name] = 'Required';
        else delete newErrors[name];
        break;
    }
    setErrors(newErrors);

    if (sameAddress && name === 'correspondenceAddress') {
      setFormData((prev) => ({ ...prev, permanentAddress: value }));
    }
  };

  const handleSameAddressChange = () => {
    setSameAddress(!sameAddress);
    if (!sameAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.correspondenceAddress,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: '',
      }));
    }
  };

  // --- Form validation ---
  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const aadhaarRegex = /^[2-9]\d{11}$/;
    const occupationRegex = /^[A-Za-z\s]+$/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (!nameRegex.test(formData.name.trim())) newErrors.name = 'Name must contain letters only';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone.trim())) newErrors.phone = 'Invalid 10-digit phone number';

    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Select gender';
    if (!formData.correspondenceAddress) newErrors.correspondenceAddress = 'Required';
    if (!formData.permanentAddress) newErrors.permanentAddress = 'Required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Select marital status';

    // ⭐ NEW VALIDATION: OCCUPATION
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    else if (!occupationRegex.test(formData.occupation.trim()))
      newErrors.occupation = 'Occupation must contain letters only';

    if (!formData.bloodGroup) newErrors.bloodGroup = 'Select blood group';
    if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact))
      newErrors.emergencyContact = 'Invalid 10-digit number';

    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'Aadhaar is required';
    else if (!aadhaarRegex.test(formData.aadhaarNumber.trim())) newErrors.aadhaarNumber = 'Invalid Aadhaar number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const authData = JSON.parse(sessionStorage.getItem('authData') || '{}');
    if (!userId || !authData.token) {
      alert('Session expired. Please login again.');
      return;
    }

    try {
      if (formData.id) {
        await updateUserProfileApi(formData.id, formData, authData.token);
        alert('Profile updated successfully!');
      } else {
        const created = await saveUserProfileApi(userId, formData, authData.token);
        if (created?.id) sessionStorage.setItem("userProfileId", created.id);
        alert('Profile created successfully!');
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile.');
    }
  };

  const icons = {
    name: <FaUser />,
    phone: <FaPhone />,
    dob: <FaBirthdayCake />,
    gender: <FaTransgender />,
    correspondenceAddress: <FaHome />,
    permanentAddress: <FaAddressCard />,
    maritalStatus: <FaHeart />,
    occupation: <FaBriefcase />,
    bloodGroup: <FaTint />,
    emergencyContact: <FaPhone />,
    aadhaarNumber: <FaIdCard />,
  };

  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  const getInputType = (key) => {
    if (key === 'dob') return 'date';
    if (key === 'phone' || key === 'emergencyContact' || key === 'aadhaarNumber') return 'tel';
    return 'text';
  };

  return (
    <div className="profile-container">
      <h2>{isEditing ? 'Complete/Edit Your Profile' : 'Your Profile'}</h2>
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {Object.entries(formData).map(([key, value]) => {
              if (key === 'id' || key === 'user') return null;

              if (key === 'correspondenceAddress') {
                return (
                  <div key={key}>
                    <div className="form-group">
                      <label>{formatLabel(key)}</label>
                      <div className="input-with-icon">
                        <span className="icon">{icons[key]}</span>
                        <textarea
                          name={key}
                          value={value || ''}
                          onChange={handleChange}
                          placeholder="Enter correspondence address"
                        />
                      </div>
                      {errors[key] && <p className="error-text">{errors[key]}</p>}
                    </div>

                    <div className="form-group checkbox-container">
                      <input
                        type="checkbox"
                        id="sameAddress"
                        checked={sameAddress}
                        onChange={handleSameAddressChange}
                      />
                      <label htmlFor="sameAddress">Same as correspondence address</label>
                    </div>
                  </div>
                );
              }

              if (key === 'permanentAddress') {
                return (
                  <div className="form-group" key={key}>
                    <label>{formatLabel(key)}</label>
                    <div className="input-with-icon">
                      <span className="icon">{icons[key]}</span>
                      <textarea
                        name={key}
                        value={value || ''}
                        onChange={handleChange}
                        placeholder="Enter permanent address"
                        disabled={sameAddress}
                      />
                    </div>
                    {errors[key] && <p className="error-text">{errors[key]}</p>}
                  </div>
                );
              }

              return (
                <div className="form-group" key={key}>
                  <label>{formatLabel(key)}</label>
                  <div className="input-with-icon">
                    <span className="icon">{icons[key]}</span>
                    {key === 'gender' ? (
                      <select name={key} value={value || ''} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        {genderOptions.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    ) : key === 'maritalStatus' ? (
                      <select name={key} value={value || ''} onChange={handleChange}>
                        <option value="">Select Marital Status</option>
                        {maritalStatusOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : key === 'bloodGroup' ? (
                      <select name={key} value={value || ''} onChange={handleChange}>
                        <option value="">Select Blood Group</option>
                        {bloodGroupOptions.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : (key === 'phone' || key === 'emergencyContact') ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            padding: "10px",
                            background: "#eee",
                            borderRadius: "6px 0 0 6px",
                            border: "1px solid #ccc",
                          }}
                        >
                          +91
                        </span>
                        <input
                          type="tel"
                          name={key}
                          value={value || ""}
                          onChange={handleChange}
                          maxLength="10"
                          placeholder={key === 'phone' ? "Enter phone number" : "Enter emergency contact"}
                          style={{
                            borderRadius: "0 6px 6px 0",
                            borderLeft: "none",
                            flex: 1,
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type={getInputType(key)}
                        name={key}
                        value={value || ''}
                        onChange={handleChange}
                        placeholder={`Enter ${formatLabel(key)}`}
                      />
                    )}
                  </div>
                  {errors[key] && <p className="error-text">{errors[key]}</p>}
                </div>
              );
            })}
          </div>

          <button type="submit" className="submit-btn">
            Save Profile
          </button>
        </form>
      ) : (
        <div className="profile-view">
          <table>
            <tbody>
              {Object.entries(formData).map(([key, value]) =>
                key !== 'id' && key !== 'user' ? (
                  <tr key={key}>
                    <td className="profile-label">{icons[key]} {formatLabel(key)}</td>
                    <td>{value}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
          <button onClick={() => setIsEditing(true)} className="submit-btn">
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
