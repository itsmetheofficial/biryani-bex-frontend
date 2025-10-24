import { Modal, message } from "antd";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { callPostAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";

export default function NewPasswordModal({ open, closeModal }) {
  const [cookies] = useCookies(["token"]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleSave = async () => {
  if (!oldPassword) {
    message.error("Please enter your old password");
    return;
  }
  if (!newPassword || newPassword.length < 4) {
    message.error("New password must be at least 4 characters long");
    return;
  }
  if (newPassword !== confirmPassword) {
    message.error("New password and Confirm password do not match");
    return;
  }

  try {
    setLoading(true);

    const userDetails =
      typeof cookies.userDetails === "string"
        ? JSON.parse(cookies.userDetails)
        : cookies.userDetails;

    if (!userDetails?.userId) {
      message.error("User not found, please re-login");
      return;
    }

    console.log("API_ENDPOINTS.CHANGE_PASSWORD(userDetails.userId) : ",API_ENDPOINTS.CHANGE_PASSWORD(userDetails.userId))

    const response = await callPostAPI(
      API_ENDPOINTS.CHANGE_PASSWORD(userDetails.userId),
      {
        oldPassword,
        newPassword,
      },
      cookies.token
    );

    if (response?.status) {
      message.success("Password updated successfully!");
      closeModal(); // close modal after success
    } else {
      message.error(response.message || "Failed to update password");
    }
  } catch (err) {
    console.error("Password change error:", err);
    message.error("Error updating password");
  } finally {
    setLoading(false);
  }
};



  return (
    <Modal
      open={open}
      closeIcon={null}
      onCancel={closeModal}
      footer={null}
      className="history-depositModal customModal myAccountModal newPasswordModal"
      width={500}
    >
      <div className="cmHeader">
        <span>Change Password</span>
        <button onClick={closeModal}>
          <img src="/images/closeIcon.svg" alt="" />
        </button>
      </div>
      <div className="cmBody">
        {/* Old Password */}
        <div className="npFormItem">
          <label htmlFor="oldPassword">Old Password</label>
          <div className="npInputOuter">
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => e.target.value?.includes(" ") ? "" : setOldPassword(e.target.value)}
            />
          </div>
        </div>

        {/* New Password */}
        <div className="npFormItem">
          <label htmlFor="newPassword">New Password</label>
          <div className="npInputOuter">
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => e.target.value?.includes(" ") ? "" : setNewPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Confirm Password (frontend only) */}
        <div className="npFormItem">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="npInputOuter">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => e.target.value?.includes(" ") ? "" : setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          className="saveButton"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}
