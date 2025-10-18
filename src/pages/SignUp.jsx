import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { callPostAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    mobile: "",
    referralCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const { name, userName, mobile, referralCode, email, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!name || !userName || !mobile || !email || !password || !confirmPassword) {
      message.error("All fields except referral code are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      message.error("Please enter a valid email address.");
      return;
    }

    if (!mobileRegex.test(mobile)) {
      message.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password !== confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const payload = { name, userName, mobile, referralCode, email, password };
      const response = await callPostAPI(API_ENDPOINTS.SIGNUP, payload);
      if (response.status) {
        message.success(response.message || "Signup successful!");
        navigate("/login");
      } else {
        message.error(response.message || "Signup failed!");
      }
    } catch (error) {
      message.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage signUpPage">
      <div className="wrapper">
        <div className="loginPageInner">
          <div className="signUplogo">
            <img src="/images/siteLogo.svg" alt="Site Logo" />
          </div>
          <div className="lpLeft lpLeftTop">
            <h4>Create an Account</h4>
            <p>You can Signup with Gmail ID.</p>
          </div>
          <div className="lpLeft">
            <div className="lplForm">
              <div className="lplFormItem">
                <label htmlFor="name">
                  <img src="/images/userfilledIcon.svg" alt="User" />
                  <span>Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter Your Name Here"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="lplFormItem">
                <label htmlFor="mobile">
                  <img src="/images/callIcon.svg" alt="Phone" />
                  <span>Mobile</span>
                </label>
                <input
                  type="text"
                  id="mobile"
                  placeholder="Enter Your Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
              <div className="lplFormItem">
                <label htmlFor="password">
                  <img src="/images/lockIcon.svg" alt="Lock" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Your Password Here"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="lplFormItem">
                <label htmlFor="confirmPassword">
                  <img src="/images/lockIcon.svg" alt="Lock" />
                  <span>Confirm Password</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Re-Enter Your Password Here"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="plRight">
            <div className="lplForm">
              <div className="lplFormItem">
                <label htmlFor="userName">
                  <img src="/images/userfilledIcon.svg" alt="User" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  id="userName"
                  placeholder="Enter Your Username Here"
                  value={formData.userName}
                  onChange={handleChange}
                />
              </div>
              <div className="lplFormItem">
                <label htmlFor="referralCode">
                  <img src="/images/refferalIcon.svg" alt="Referral" />
                  <span>Referral Code (Optional)</span>
                </label>
                <input
                  type="text"
                  id="referralCode"
                  placeholder="Enter Referral Code"
                  value={formData.referralCode}
                  onChange={handleChange}
                />
              </div>
              <div className="lplFormItem">
                <label htmlFor="email">
                  <img src="/images/mailWhite.svg" alt="Mail" />
                  <span>Email ID</span>
                </label>
                <input
                  type="text"
                  id="email"
                  placeholder="Enter Your Email ID Here"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="spButtons lplButtons">
            <div className="spbLeft">
              <button
                className="login"
                onClick={handleSubmit}
                disabled={loading}
              >
                <span>{loading ? "Signing Up..." : "Sign Up"}</span>
                {!loading && (
                  <img src="/images/rightArrowWhiteOutLIned.svg" alt="Arrow" />
                )}
              </button>
            </div>
            <div className="spbRight">
              <div className="lplForgotPassword">
                <button onClick={() => navigate("/login")}>
                  <span>Already have an Account? Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
