import { Modal, Select, Switch } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import MyAccount from "../pages/MyAccount";
import { SocketContext } from "../App";
import { BASE_URL } from "../api/apiConfig";

const Header = ({ setIsChatOpen }) => {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chatOpenparams = queryParams.get("chatopen");

  const [cookies] = useCookies();
  const [userDetails, setUserDetails] = useState(cookies?.userDetails);

  useEffect(() => {
    setUserDetails(cookies?.userDetails);
  }, [cookies]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === "balance_update") {
          console.log("Updated Balance from socket:", data.balance);
          setUserDetails((prev) => ({
            ...prev,
            balance: data.balance,
          }));
        }
      } catch (err) {
        console.error("Error parsing socket message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);


  const languageItems = [
    { key: "1", label: "English" },
    { key: "2", label: "Hindi" },
  ];

  const [visible, setVisible] = useState(false);
  const [myAccountModalVisible, setmyAccountModalVisible] = useState(false);

  useEffect(() => {
    setUserDetails(userDetails);
  }, [userDetails]);

  useEffect(() => {
    if (chatOpenparams === "true") {
      setIsChatOpen(true);
    }
  }, [chatOpenparams, setIsChatOpen]);

  const showModal = () => setVisible(true);
  const handleCancel = () => setVisible(false);

  return (
    <>
      <header className="mainHeader">
        <div className="mhLeft">
          <Link to="/">
            <img src="/images/siteLogo.png" alt="Site Logo" width={170} />
          </Link>
          <div className="mhPriceOuter">
            <div className="mhPrice">
              <div>
                <div className="mhCurrency">
                  <span>₹</span>
                </div>
                {/* ✅ dynamic balance */}
                <span className="mhAmount">
                  {userDetails?.mainWallet?.toLocaleString?.() || "0"}
                </span>
              </div>
              <button onClick={() => navigate("/deposit")}>
                <img src="/images/plusIcon.svg" alt="Plus Icon" />{" "}
                <span>Deposit</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mhRight">
          <div className="mhProfileOuter">
            <div className="mhProfile">
              <div className="mhpIcon">
                <img src={userDetails?.profileImage?.length ? `${BASE_URL}${userDetails?.profileImage}`:"/images/profileIocn.png"} alt="Profile Icon" />
              </div>
              {/* ✅ dynamic username */}
              <div className="mhpText">{userDetails?.userName || "Guest"}</div>
              <div className="mhpRight">
                <div className="whiteBorderOuter">
                  <button
                    type="text"
                    onClick={() => setmyAccountModalVisible(true)}
                  >
                    <img src="/images/downArrowIcon.svg" alt="Dropdown Arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mhNavigation">
            <div className="mhnItem" onClick={showModal}>
              <div className="mhnIconOuter">
                <div className="mhnIcon">
                  <img src="/images/settingIcon.png" alt="" />
                </div>
              </div>
              <div className="mhnText">Settings</div>
            </div>
            <div
              className={`mhnItem ${
                location.pathname === "/notifications" ? "active" : ""
              }`}
              onClick={() => {
                if (location.pathname !== "/notifications") {
                  navigate("/notifications");
                } else {
                  navigate("/");
                }
              }}
            >
              <div className="mhnIconOuter">
                <div className="mhnIcon">
                  <img src="/images/notificationIcon.png" alt="" />
                </div>
              </div>
              <div className="mhnText">Notification</div>
            </div>
            <div className="mhnItem">
              <div
                className="mhnIconOuter"
                onClick={() => setIsChatOpen((prev) => !prev)}
              >
                <div className="mhnIcon">
                  <img src="/images/helpIcon.png" alt="" />
                </div>
              </div>
              <div className="mhnText">Support</div>
            </div>
          </div>
        </div>
      </header>

      <Modal
        open={visible}
        closeIcon={null}
        onCancel={handleCancel}
        footer={null}
        className="SettingsModal customModal"
        width={760}
      >
        <div className="cmHeader">
          <span>Settings</span>
          <button onClick={handleCancel}>
            <img src="/images/closeIcon.svg" alt="" />
          </button>
        </div>
        <div className="cmBody">
          <div className="cmRowItem">
            <div className="cmrLeft">
              <img src="/images/notificationBell.svg" alt="" />
              <span>Notification</span>
            </div>
            <div className="cmrRight">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </div>
          </div>
          <div className="cmRowItem">
            <div className="cmrLeft">
              <img src="/images/tutorialsIcon.svg" alt="" />
              <span>Tutorials</span>
            </div>
            <div className="cmrRight">
              <button>View</button>
            </div>
          </div>
          <div className="cmRowItem">
            <div className="cmrLeft">
              <img src="/images/globleIcon.svg" alt="" />
              <span>Language</span>
            </div>
            <div className="cmrRight">
              <Select
                defaultValue="1"
                style={{ width: 200 }}
                onChange={(value) => console.log(value)}
                suffixIcon={
                  <img src="/images/downfilledarroricon.svg" width={20} />
                }
              >
                {languageItems.map((item) => (
                  <Select.Option key={item.key} value={item.key}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="cmRowItem">
            <div className="cmrLeft">
              <img src="/images/privacyIcon.svg" alt="" />
              <span>Privacy & Policy</span>
            </div>
            <div className="cmrRight">
              <button>Read</button>
            </div>
          </div>
          <div className="cmRowItem">
            <div className="cmrLeft">
              <img src="/images/helpIcon.png" alt="" />
              <span>Support</span>
            </div>
            <div className="cmrRight">
              <button
                onClick={() => {
                  setIsChatOpen(true);
                  handleCancel();
                }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {myAccountModalVisible ? (
        <MyAccount open={myAccountModalVisible} setOpen={setmyAccountModalVisible} />
      ) : null}
    </>
  );
};

export default Header;
