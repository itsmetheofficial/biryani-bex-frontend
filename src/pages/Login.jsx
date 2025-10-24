import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal, Spin } from "antd";
import {
  callPostAPI,
  fetchUserBalanceHelper,
  fetchUserDetailsHelper,
} from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import { useCookies } from "react-cookie";
import Splash from "./Splash"; // 🔹 Import splash page

export default function Login() {
  const navigate = useNavigate();

  // ✅ useCookies hook
  const [cookies, setCookie, removeCookie] = useCookies([
    "token",
    "userDetails",
  ]);

  const [formData, setFormData] = useState({
    loginInput: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1=send otp, 2=verify otp
  const [resetInput, setResetInput] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
     if (value.includes(" ")) {
            return;
      }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async () => {
    if (!formData.loginInput || !formData.password) {
      message.error("Email/Mobile and password are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await callPostAPI(API_ENDPOINTS.LOGIN, formData);

      if (response.token && response.user?._id) {
        // ✅ set token with useCookies
        setCookie("token", response.token, { path: "/", sameSite: "strict" });
        setCookie("userDetails", response.user, {
          path: "/",
          sameSite: "strict",
        });

        message.success(response.message || "Login successful!");
        navigate("/");
      } else {
        message.error(response.message || "Login failed!");
      }
    } catch (error) {
      message.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 🔹 Forgot Password Flow
  // -------------------------------
  const handleSendOtp = async () => {
    if (!resetInput) {
      message.error("Please enter your registered Email or Mobile.");
      return;
    }
    try {
      setResetLoading(true);
      const response = await callPostAPI(API_ENDPOINTS.SEND_RESET_OTP, {
        loginInput: resetInput,
      });

      if (response?.status) {
        message.success("OTP sent successfully!");
        setResetStep(2);
      } else {
        message.error(response.message || "Failed to send OTP");
      }
    } catch (err) {
      message.error("Error sending OTP");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!otp || !newPassword) {
      message.error("OTP and New Password are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    try {
      setResetLoading(true);
      const response = await callPostAPI(API_ENDPOINTS.RESET_PASSWORD, {
        loginInput: resetInput,
        otp,
        newPassword,
      });

      if (response?.status) {
        message.success("Password reset successfully! Please login.");
        setForgotVisible(false);
        setResetStep(1);
        setResetInput("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        message.error(response.message || "Failed to reset password");
      }
    } catch (err) {
      message.error("Error resetting password");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="loginPage signInPage">
      <div className="wrapper">
        <div className="loginPageInner">
          <div className="lpLeft">
            <h4>Sign in</h4>
            <p>You can login with email or mobile number.</p>
            <div className="lplForm">
              {/* Email / Mobile */}
              <div className="lplFormItem">
                <label htmlFor="loginInput">
                  <img src="/images/mailWhite.svg" alt="" />
                  <span>Email / Mobile</span>
                </label>
                <input
                  type="text"
                  id="loginInput"
                  placeholder="Enter Your Email or Mobile Here"
                  value={formData.loginInput}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="lplFormItem">
                <label htmlFor="password">
                  <img src="/images/lockIcon.svg" alt="" />
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

              {/* Login + Signup */}
              <div className="lplButtons">
                <button
                  className="login"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  <span>{loading ? "Logging in..." : "Login"}</span>
                  {!loading && (
                    <img
                      src="/images/rightArrowWhiteOutLIned.svg"
                      alt="Arrow"
                    />
                  )}
                </button>
                <button className="signUp" onClick={() => navigate("/sign-up")}>
                  <span>Signup</span>
                  <img src="/images/rightArrowWhiteOutLIned.svg" alt="Arrow" />
                </button>
              </div>

              {/* Forgot Password */}
              <div className="lplForgotPassword">
                <button onClick={() => setForgotVisible(true)}>
                  <img src="/images/lockIcon.svg" alt="" />
                  <span>Forgot Password?</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right logo */}
          <div className="plRight">
            <div className="plrightLogo">
              <img src="/images/siteLogo.png" alt="Logo" />
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotVisible}
        closeIcon={null}
        onCancel={() =>resetLoading?null: setForgotVisible(false)}
        footer={null}
        className="customModal forgotPasswordModal"
        width={550}
        maskClosable={false}
    
      >
        <div className="cmHeader">
          <span>Reset Password</span>
          <button onClick={() => setForgotVisible(false)}>
            <img src="/images/closeIcon.svg" alt="close" />
          </button>
        </div>

        <div className="cmBody" style={{position:"relative"}}>
            {
              resetLoading ?
                <div className='loadingOverData'>
                    <Spin size="large" tip="Loading" />
                </div>
              :null
            }
          {resetStep === 1 && (
            <>
              <div className="lplFormItem">
                <label>
                  <span>
                    Enter your registered Email or Mobile to receive OTP.
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Email / Mobile"
                  value={resetInput}
                  onChange={(e) => e.target.value?.includes(" ") ? null : setResetInput(e.target.value)}
                />
              </div>
              <button
                className="saveButton"
                onClick={handleSendOtp}
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {resetStep === 2 && (
              <>
                <div className="lplFormItem">
                  <label>
                    <span>Enter the OTP and your new password.</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => e.target.value?.includes(" ") ? null : setOtp(e.target.value)}
                  />
                </div>
                <div className="lplFormItem">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => e.target.value?.includes(" ") ? null : setNewPassword(e.target.value)}
                  />
                </div>
                <div className="lplFormItem">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => e.target.value?.includes(" ") ? null : setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  className="saveButton"
                  onClick={handleVerifyOtpAndReset}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
        </div>
      </Modal>
    </div>
  );
}
