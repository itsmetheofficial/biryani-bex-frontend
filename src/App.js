// src/App.js
import React, { useEffect, useState } from "react";
import { Layout, Button, message } from "antd";
import { Route, Routes, useNavigate } from "react-router-dom";
import "../src/index.css";

import Home from "./pages/Home";
import Mybets from "./pages/Mybets";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatSection from "./components/ChatSection";
import GameStatics from "./pages/GameStatics";
import Notification from "./pages/Notification";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MyWallet from "./pages/MyWallet";
import Promotions from "./pages/Promotions";
import Offers from "./pages/Offers";
import DailyAttendance from "./pages/DailyAttendance";
import RechargeBonus from "./pages/RechargeBonus";
import BetCommission from "./pages/BetCommission";
import DepositPage from "./pages/DepositPage";
import WithdrawPage from "./pages/WithdrawPage";
import AllTransactions from "./pages/AllTransactions";
import DepositHistory from "./pages/DepositHistory";
import WithdrawHistory from "./pages/WithdrawHistory";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PasswordReset from "./pages/PasswordReset";
import Gifts from "./pages/Gifts";
import Splash from "./pages/Splash";
import AttendanceHistory from "./pages/AttendanceHistory";
import Rules from "./pages/Rules";
import DailySalarySystem from "./pages/DailySalarySystem";
import SubordinateData from "./pages/SubordinateData";
import UsdtDeposit from "./pages/UsdtDeposit";
import AddAccountDetails from "./pages/AddAccountDetails";
import AddUPIAccount from "./pages/AddUPIAccount";
import AddBankAccount from "./pages/AddBankAccount";
import AddUSDTAccount from "./pages/AddUSDTAccount";

import {
  verifyTokenHelper,
  fetchUserDetailsHelper,
  fetchUserBalanceHelper,
  callGetAPI,
  connectSocket,
  disconnectSocket,   // ✅ new function from apiHelper.js
} from "./api/apiHelper";
import { Cookies } from "react-cookie";
import { API_ENDPOINTS } from "./api/apiConfig";
import UPIDeposit from "./pages/UPIDeposit";

export const SocketContext = React.createContext(null); // ✅ global socket context

const { Content } = Layout;
const cookies = new Cookies();

function App() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [desktopSize, setdeskTopSize] = useState(true);
  const [loading, setLoading] = useState(true);
  const [allSettings, setAllsettings] = useState(null);
  const [socket, setSocket] = useState(null); // ✅ store socket

  const checkScreenWidth = () => {
    if (window.innerWidth < 1501) {
      setIsChatOpen(false);
      setdeskTopSize(false);
    } else {
      setIsChatOpen(true);
      setdeskTopSize(true);
    }

    if (window.innerWidth < 993) {
      setCollapsed(true);
    }
  };

  const fetchSettingsHelper = async () => {
    const token = cookies.get("token");
    try {
      const res = await callGetAPI(API_ENDPOINTS.GET_SETTINGS, token);
      if (res?.success) {
        setAllsettings(res?.settings);
        return res;
      } else {
        message.error("Failed to fetch settings");
        return null;
      }
    } catch (err) {
      message.error("Failed to fetch settings");
      return null;
    }
  };

  // 🔹 Verify login + fetch user details & balance
  useEffect(() => {
    const initAuth = async () => {
      const token = cookies.get("token");
      if (token) {
        setLoading(true);
        const userId = await verifyTokenHelper();

        if (!userId && window.location.pathname !== "/login") {
          navigate("/login");
          return;
        }

        const [userDetailsRes, userBalanceRes] = await Promise.allSettled([
          fetchUserDetailsHelper(userId),
          fetchUserBalanceHelper(userId),
          fetchSettingsHelper(),
        ]);

        if (
          userDetailsRes.status === "fulfilled" &&
          userBalanceRes.status === "fulfilled"
        ) {
          setLoading(false);

          // ✅ connect socket after successful login + data fetch
         const newSocket = connectSocket(token, (data) => {
            console.log("📨 Received WebSocket message:", data);
            // 👉 Dispatch to Redux, update state, trigger notifications, etc.
          });
          setSocket(newSocket);
        } else {
          console.error("Auth initialization failed", userDetailsRes, userBalanceRes);
          setLoading(false);
        }
      } else {
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
        setLoading(false);
      }
    };

    initAuth();

    // cleanup socket on unmount
    return () => {
      if (socket) {
        disconnectSocket();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies?.get("token")]);

  useEffect(() => {
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  const toggleMenu = () => {
    setCollapsed(!collapsed);
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <SocketContext.Provider value={socket}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route
          path="*"
          element={
            <Layout className="layout">
              <Header setIsChatOpen={setIsChatOpen} />
              <Layout>
                <Sidebar collapsed={collapsed} toggleMenu={toggleMenu} />
                <Layout
                  className={`layout-content ${collapsed ? "collapsed" : ""} ${
                    desktopSize
                      ? !isChatOpen
                        ? "contentRight"
                        : "contentRightOpen"
                      : ""
                  }`}
                >
                  {collapsed && (
                    <div className="shtRight shtRightRotate">
                      <Button
                        type="primary"
                        onClick={toggleMenu}
                        className="sider-button"
                      >
                        <img src="/images/leftArrowFilled.svg" alt="" />
                      </Button>
                    </div>
                  )}

                  <Content className={`content`}>
                    <Routes>
                      <Route path="/" element={<Home isChatOpen={isChatOpen} />} />
                      <Route path="/my-bets" element={<Mybets />} />
                      <Route path="/game-statics" element={<GameStatics />} />
                      <Route path="/notifications" element={<Notification />} />
                      <Route
                        path="/about"
                        element={<AboutUs allSettings={allSettings} />}
                      />
                      <Route
                        path="/privacy-policy"
                        element={<PrivacyPolicy allSettings={allSettings} />}
                      />
                      <Route path="/my-wallet" element={<MyWallet />} />
                      <Route path="/promotions" element={<Promotions />} />
                      <Route path="/offers" element={<Offers />} />
                      <Route
                        path="/daily-attendance"
                        element={<DailyAttendance />}
                      />
                      <Route
                        path="/recharge-bonus"
                        element={<RechargeBonus />}
                      />
                      <Route path="/bet-commission" element={<BetCommission />} />
                      <Route path="/deposit" element={<DepositPage />} />
                      <Route path="/withdraw" element={<WithdrawPage />} />
                      <Route
                        path="/all-transactions"
                        element={<AllTransactions />}
                      />
                      <Route
                        path="/deposit-history"
                        element={<DepositHistory />}
                      />
                      <Route
                        path="/withdraw-history"
                        element={<WithdrawHistory />}
                      />
                      <Route path="/gifts" element={<Gifts />} />
                      <Route
                        path="/attendance-history"
                        element={<AttendanceHistory />}
                      />
                      <Route path="/rules" element={<Rules />} />
                      <Route
                        path="/daily-salary-system"
                        element={<DailySalarySystem />}
                      />
                      <Route
                        path="/subordinate-data"
                        element={<SubordinateData />}
                      />
                      <Route
                        path="/usdt-deposit"
                        element={<UsdtDeposit />}
                      />
                      <Route
                        path="/upi-deposit"
                        element={<UPIDeposit />}
                      />
                      <Route
                        path="/add-account-details"
                        element={<AddAccountDetails />}
                      />
                      <Route path="/add-bank-account" element={<AddBankAccount />} />
                      <Route path="/add-upi-account" element={<AddUPIAccount />} />
                      <Route path="/add-usdt-account" element={<AddUSDTAccount />} />
                    </Routes>
                  </Content>
                </Layout>

                {isChatOpen ? (
                  <ChatSection
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                  />
                ) : (
                  <button
                    className="chatSectionButton"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <img src="/images/chatIcon.png" alt="" />
                  </button>
                )}
              </Layout>
            </Layout>
          }
        />
      </Routes>
    </SocketContext.Provider>
  );
}

export default App;
