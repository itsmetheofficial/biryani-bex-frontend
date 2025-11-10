// src/App.js
import React, { useEffect, useState } from "react";
import { Layout, Button, message } from "antd";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
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
import { load } from "react-cookies";

export const SocketContext = React.createContext(null); // ✅ global socket context

const { Content } = Layout;
const cookies = new Cookies();

const PageWrapper = ({ title, children }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return children;
};
function App() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const token = cookies.get("token");

    // Define routes that require authentication
    const publicRoutes = ["/login", "/sign-up", "/password-reset", "/splash"];

    const isPublicRoute = publicRoutes.includes(location.pathname);

    console.log("🔑 Token:", token);
    console.log("🔑 Tlocation.pathnameoken:", location.pathname);
    console.log("🔑loading", loading);
    
    if (!token && !isPublicRoute) {
      navigate("/login", { replace: true });
    }else if(token && isPublicRoute && !loading){
      navigate("/", { replace: true });
    }
  }, [location.pathname,loading]);

  // 🔹 Verify login + fetch user details & balance
  useEffect(() => {
    const initAuth = async () => {
      const token = cookies.get("token");
      if (token) {
        setLoading(true);
        const userId = await verifyTokenHelper();

        if (!userId && window.location.pathname !== "/login" && window.location.pathname !== "/sign-up") {
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
        if (window.location.pathname !== "/login" && window.location.pathname !== "/sign-up") {
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
        <Route path="/login" element={
          <PageWrapper title="Login - Biryani Bet" >
            <Login />
          </PageWrapper>} />
        <Route path="/splash" element={
          <PageWrapper title="Biryani Bet" >
            <Splash /> 
          </PageWrapper>} />
        <Route path="/sign-up" element={
          <PageWrapper title="Sign Up - Biryani Bet" >
            <SignUp /> 
          </PageWrapper>} />
        <Route path="/password-reset" element={
          <PageWrapper title="Password Reset - Biryani Bet">
            <PasswordReset /> 
          </PageWrapper>} />
        <Route
          path="*"
          element={
            <Layout className="layout">
              <Header setIsChatOpen={setIsChatOpen} toggleMenu={toggleMenu} />
              <Layout>
                <Sidebar collapsed={collapsed} toggleMenu={toggleMenu} />
                <Layout
                  className={`layout-content ${collapsed ? "collapsed" : ""} ${desktopSize
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
                      <Route path="/" element={
                        <PageWrapper title="Home page - Biryani Bet">
                          <Home isChatOpen={isChatOpen} />
                        </PageWrapper>} />
                      <Route path="/my-bets" element={
                        <PageWrapper title="My bets - Biryani Bet">
                          <Mybets /> 
                        </PageWrapper>} />
                      <Route path="/game-statics" element={
                        <PageWrapper title="Game statics - Biryani Bet">
                          <GameStatics />
                        </PageWrapper>} />
                      <Route path="/notifications" element={
                        <PageWrapper title="Notifications - Biryani Bet" >
                          <Notification /> 
                        </PageWrapper>} />
                      <Route
                        path="/about"
                        element={
                          <PageWrapper title="About Us - Biryani Bet">
                            <AboutUs allSettings={allSettings} /> 
                          </PageWrapper>}
                      />
                      <Route 
                        path="/privacy-policy"
                        element={
                          <PageWrapper title="Privacy Policy - Biryani Bet">
                            <PrivacyPolicy allSettings={allSettings} /> 
                          </PageWrapper>}
                      />
                      <Route path="/my-wallet" element={
                        <PageWrapper title="My Wallet - Biryani Bet" >
                          <MyWallet /> 
                        </PageWrapper>} />
                      <Route path="/promotions" element={
                        <PageWrapper title="Promotions - Biryani Bet">
                          <Promotions /> 
                        </PageWrapper>} />
                      <Route path="/offers" element={
                        <PageWrapper title="Offers - Biryani Bet">
                          <Offers /> 
                        </PageWrapper>} />
                      <Route 
                        path="/daily-attendance"
                        element={
                          <PageWrapper title="Daily Attendance - Biryani Bet" ><DailyAttendance /> </PageWrapper>}
                      />
                      <Route 
                        path="/recharge-bonus"
                        element={
                          <PageWrapper title="Recharge Bonus - Biryani Bet"><RechargeBonus /> </PageWrapper>}
                      />
                      <Route path="/bet-commission" element={
                        <PageWrapper title="Bet Commission - Biryani Bet" ><BetCommission /> </PageWrapper>} />
                      <Route path="/deposit" element={
                        <PageWrapper title="Deposit - Biryani Bet" ><DepositPage /> </PageWrapper>} />
                      <Route path="/withdraw" element={
                        <PageWrapper title="Withdraw - Biryani Bet" ><WithdrawPage /> </PageWrapper>} />
                      <Route
                        path="/all-transactions"
                        element={
                          <PageWrapper title="All Transactions - Biryani Bet" ><AllTransactions /> </PageWrapper>}
                      />
                      <Route
                        path="/deposit-history"
                        element={
                          <PageWrapper title="Deposit History - Biryani Bet" ><DepositHistory /> </PageWrapper>}
                      />
                      <Route
                        path="/withdraw-history"
                        element={
                          <PageWrapper title="Withdraw History - Biryani Bet" ><WithdrawHistory /> </PageWrapper>}
                      />
                      <Route path="/gifts" element={
                        <PageWrapper title="Gifts - Biryani Bet" ><Gifts /> </PageWrapper>} />
                      <Route
                        path="/attendance-history"
                        element={
                          <PageWrapper title="Attendance History - Biryani Bet" ><AttendanceHistory /> </PageWrapper>}
                      />
                      <Route path="/rules" element={
                        <PageWrapper title="Rules - Biryani Bet" ><Rules /> </PageWrapper>} />
                      <Route
                        path="/daily-salary-system"
                        element={
                          <PageWrapper title="Daily Salary System - Biryani Bet" ><DailySalarySystem /> </PageWrapper>}
                      />
                      <Route
                        path="/subordinate-data"
                        element={
                          <PageWrapper title="Subordinate Data - Biryani Bet" ><SubordinateData /> </PageWrapper>}
                      />
                      <Route
                        path="/usdt-deposit"
                        element={
                          <PageWrapper title="USDT Deposit - Biryani Bet" ><UsdtDeposit /> </PageWrapper>}
                      />
                      <Route
                        path="/upi-deposit"
                        element={
                          <PageWrapper title="UPI Deposit - Biryani Bet" ><UPIDeposit /> </PageWrapper>}
                      />
                      <Route
                        path="/add-account-details"
                        element={
                          <PageWrapper title="Add Account Details - Biryani Bet" ><AddAccountDetails /> </PageWrapper>}
                      />
                      <Route path="/add-bank-account" element={
                        <PageWrapper title="Add Bank Account - Biryani Bet" ><AddBankAccount /> </PageWrapper>} />
                      <Route path="/add-upi-account" element={
                        <PageWrapper title="Add UPI Account - Biryani Bet" ><AddUPIAccount /> </PageWrapper>} />
                      <Route path="/add-usdt-account" element={
                        <PageWrapper title="Add USDT Account - Biryani Bet" ><AddUSDTAccount /> </PageWrapper>} />
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
