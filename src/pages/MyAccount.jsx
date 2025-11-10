import { message, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import NewPasswordModal from "../components/NewPasswordModal";
import SuccessModal from "../components/SuccessModal";
import { callPostAPI } from "../api/apiHelper";
import { API_ENDPOINTS, BASE_URL } from "../api/apiConfig";
import moment from "moment";

export default function MyAccount({ open, setOpen }) {
  const [cookies, setCookie, removeCookie] = useCookies(["userDetails", "token"]);
  const navigate = useNavigate();

  const profileNameRef = useRef(null);
  const fileInputRef = useRef(null);

  const [newPasswordModalVisible, setNewPasswordModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutConfirmationModal, setShowLogoutConfirmationModal] = useState(false);

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    balance: 0,
    lastLogin: "",
    profileImage: "", // ✅ Added for profile image
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    try {
      if (cookies.userDetails) {
        const parsed =
          typeof cookies.userDetails === "string"
            ? JSON.parse(cookies.userDetails)
            : cookies.userDetails;
        setUserDetails(parsed);
      }
    } catch (err) {
      console.error("Invalid cookie format:", err);
    }
  }, [cookies.userDetails]);

  const handleCancel = () => setOpen(false);

  const _openSuccesModal = (msg) => {
    setMessageText(msg);
    setSuccessModalVisible(true);
    setTimeout(() => setSuccessModalVisible(false), 2000);
  };

  const validateUserData = () => {
    if (!userDetails.name?.trim()) {
      message.error("Name cannot be empty");
      return false;
    }
    if (!userDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      message.error("Enter a valid email address");
      return false;
    }
    if (!userDetails.mobile || !/^\d{10}$/.test(userDetails.mobile)) {
      message.error("Enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateUserData()) return;

    try {
      setLoading(true);
      const token = cookies.token;
      if (!token) {
        message.error("Not authorized. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("name", userDetails.name.trim());
      formData.append("email", userDetails.email.trim());
      formData.append("mobile", userDetails.mobile.trim());

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const response = await callPostAPI(
        API_ENDPOINTS.UPDATE_USER_DETAILS(cookies?.userDetails?.userId),
        formData,
        token,
        true // Indicate this is FormData
      );

      if (response?.updatedUser?._id) {
        setCookie("userDetails", response.updatedUser, { path: "/" });
        setUserDetails(response.updatedUser);
        setSelectedFile(null);
        _openSuccesModal("Profile updated successfully!");
      } else {
        message.error(response.message || "Failed to update profile");
      }
    } catch (err) {
      message.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };
  
  const _logout=()=>{
    setLogoutLoading(true);
    setShowLogoutConfirmationModal(false);
    setTimeout(() => {
      removeCookie("token", { path: "/" });
      removeCookie("userDetails", { path: "/" });
      localStorage.clear();
      navigate("/login");
    }, 500);
    
  }

  return (
    <>
      <Modal
        open={open}
        closeIcon={null}
        onCancel={handleCancel}
        footer={null}
        className="history-depositModal customModal myAccountModal"
        width={1000}
        position='center center'
      >
        <div className="cmHeader">
          <span>My Account</span>
          <button onClick={handleCancel}>
            <img src="/images/closeIcon.svg" alt="" />
          </button>
        </div>
        <div className="cmBody">
          <div className="mayAccountBody">
            <div className="myAccountLeft">
              {/* ✅ Profile Image Click Upload */}
              <div
                className="malIcon"
                onClick={() => fileInputRef.current.click()}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : userDetails?.profileImage?.length? `${BASE_URL}${userDetails?.profileImage}` : "/images/profileIocn.png"
                  }
                  alt="Profile"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("image/")) {
                      setSelectedFile(file);
                    } else {
                      message.error("Please select a valid image file");
                    }
                  }}
                />
              </div>

              <div className="marInputItemOuter">
                <div className="malName">
                  <input
                    ref={profileNameRef}
                    type="text"
                    value={userDetails.name || ""}
                    onChange={(e) =>
                      e.target.value?.includes(" ")?null:
                      setUserDetails({ ...userDetails, name: e.target.value })
                    }
                  />
                  <button onClick={() => profileNameRef.current.focus()}>
                    <img src="/images/editIcon.svg" alt="" />
                  </button>
                </div>
              </div>
              <div className="malLastLogin">
                <p>
                  Last Login :{" "}
                  {userDetails?.lastLogin?.length > 0
                    ? moment(userDetails.lastLogin).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="myAccountRight">
              {/* ✅ Phone Number */}
              <div className="marItems phone gamail">
                <p>
                  <img src="/images/phoneWhite.svg" alt="" />
                  <span>Phone Number</span>
                </p>
                <div className="marInputItemOuter">
                  <div className="marInputItem">
                    <input
                      value={userDetails.mobile || ""}
                      type="tel"
                      placeholder="Enter Phone Number"
                      maxLength={10}
                      onKeyDown={(event) => {
                        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                        if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, mobile: e.target.value })
                      }
                      disabled={true}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Email */}
              <div className="marItems gamail">
                <p>
                  <img src="/images/gmailIcon.svg" alt="" />
                  <span>Email ID</span>
                </p>
                <div className="marInputItemOuter">
                  <div className="marInputItem">
                    <input
                      type="email"
                      value={userDetails.email || ""}
                      onChange={(e) =>
                        e.target.value?.includes(" ")?null:
                        setUserDetails({ ...userDetails, email: e.target.value })
                      }
                      disabled={true}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Password */}
              <div className="marItems password">
                <p>
                  <img src="/images/lockIcon.svg" alt="" />
                  <span>Password</span>
                </p>
                <div className="marInputItemOuter">
                  <div className="marInputItem">
                    <input readOnly type="text" value={"****"} />
                    <div className="marButtonOuter">
                      <button onClick={() => setNewPasswordModalVisible(true)}>
                        <span>Edit</span>
                        <img src="/images/RightArrowcolored.svg" alt="" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Buttons */}
              <div className="accountButtons">
                <button
                  onClick={handleSaveProfile}
                  className="saveButton"
                  disabled={loading}
                >
                  <span>{loading ? "Saving..." : "Save"}</span>
                  {!loading && <img src="/images/rightArrowWhite.svg" alt="" />}
                </button>
                <button
                  onClick={()=>setShowLogoutConfirmationModal(true)}
                  className="marLogout"
                  disabled={logoutLoading}
                >
                  <span>{logoutLoading ? "Logging out..." : "Log out"}</span>
                  {!logoutLoading && <img src="/images/rightArrowWhite.svg" alt="" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ✅ Password Modal */}
      {newPasswordModalVisible && (
        <NewPasswordModal
          open={newPasswordModalVisible}
          closeModal={() => setNewPasswordModalVisible(false)}
        />
      )}

      {/* ✅ Success Modal */}
      {successModalVisible && (
        <SuccessModal
          open={successModalVisible}
          setOpen={() => setSuccessModalVisible(false)}
          messageText={messageText}
        />
      )}

      {
        showLogoutConfirmationModal && (
           <Modal
            title="Confirm Logout"
            open={showLogoutConfirmationModal}
            onOk={_logout}   // Triggered when the user clicks "Yes"
            onCancel={()=>setShowLogoutConfirmationModal(false)}  // Triggered when the user clicks "No" or closes the modal
            okText="Yes"
            cancelText="No"
            className=" myAccountLogoutModal"
          >
            <p>Are you sure you want to log out?</p>
          </Modal>
        )
      }
    </>
  );
}
