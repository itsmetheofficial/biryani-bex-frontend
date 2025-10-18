// src/api/apiHelper.js
import { BASE_URL, API_ENDPOINTS } from "./apiConfig";
import { message } from "antd";
import { Cookies } from "react-cookie";

const cookies = new Cookies();
let socket = null;

// ========================
// 🔹 Common API Helpers
// ========================
const handleUnauthorized = () => {
  cookies.remove("token", { path: "/" });
  cookies.remove("userDetails", { path: "/" }); 

  if (window.location.pathname !== "/login") {
    // Optionally redirect:
    // window.location.href = "/login";
  }
};

const buildHeaders = (token, isFormData = false) => {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized: Redirecting to login...");
  }
  const data = await res.json();
  if (!res?.status) throw data;
  return data;
};

export const callGetAPI = async (url, token = null, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${BASE_URL}${url}${queryString ? `?${queryString}` : ""}`;
  const res = await fetch(fullUrl, {
    method: "GET",
    headers: buildHeaders(token),
  });
  return await handleResponse(res);
};

export const callPostAPI = async (
  url,
  data = {},
  token = null,
  isFormData = false
) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: buildHeaders(token, isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const callPatchAPI = async (
  url,
  data = {},
  token = null,
  isFormData = false
) => {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: buildHeaders(token, isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("PATCH API Error:", err);
    throw err;
  }
};

export const callDeleteAPI = async (url, token = null) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  return await handleResponse(res);
};

// =======================================================
// 🔹 High-level Auth + User Helpers
// =======================================================
export const verifyTokenHelper = async () => {
  const token = cookies.get("token");
  if (!token) {
    handleUnauthorized();
    return null;
  }

  try {
    const res = await callGetAPI(API_ENDPOINTS.VERIFY_TOKEN, token);

    if (res?.status && res?.userId) {
      cookies.set("token", token, { path: "/" });
      return res.userId;
    } else {
      handleUnauthorized();
      return null;
    }
  } catch (err) {
    console.error("Session expired. Please login again.");
    handleUnauthorized();
    return null;
  }
};

export const fetchUserDetailsHelper = async (userId) => {
  const token = cookies.get("token");
  if (!token || !userId) {
    handleUnauthorized();
    return null;
  }

  try {
    const res = await callGetAPI(API_ENDPOINTS.GET_USER_DETAILS(userId), token);
    if (res?._id) {
      cookies.set("userDetails", res, { path: "/" });
      return res;
    } else {
      message.error("Failed to fetch user details");
      return null;
    }
  } catch (err) {
    message.error("Failed to fetch user details");
    return null;
  }
};

export const fetchUserBalanceHelper = async (userId) => {
  const token = cookies.get("token");
  if (!token || !userId) {
    handleUnauthorized();
    return null;
  }

  try {
    const res = await callGetAPI(API_ENDPOINTS.FETCH_USER_BALANCE(userId), token);
    if (res?.status) {
      const userDetails = cookies.get("userDetails") || {};
      const updatedUser = {
        ...userDetails,
        balance: res.userBalance,
      };
      cookies.set("userDetails", updatedUser, { path: "/" });
      return res.userBalance;
    } else {
      message.error("Failed to fetch user balance");
      return null;
    }
  } catch (err) {
    message.error("Failed to fetch user balance");
    return null;
  }
};

// =======================================================
// 🔹 WebSocket Helpers (Support Chat)
// =======================================================
export const connectSocket = (token, onMessageCallback) => {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  // Remove token from URL
  const wsUrl = "wss://biryanibet.desiapi.com/ws/";
  socket = new WebSocket(wsUrl,token);

socket.onopen = () => {
  console.log("🔌 WebSocket connected");
  // console.log("Sending AUTH with token:", token);
  // socket.send(JSON.stringify({ type: "AUTH", token }));
};


  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 Received from WebSocket:", data);

      if (data?.type === "CONNECTED") {
        console.log("✅ Socket authenticated");
        socket.send(JSON.stringify({ type: "SUBSCRIBE" }));
      }

      if (data?.message === "subscribed successfully.") {
        console.log("✅ Subscribed to support chat");
      }

      if (data?.type === "ADMIN_RESPONSE") {
        onMessageCallback?.(data.data);
      }
    } catch (err) {
      console.error("⚠️ WebSocket message parse error:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  socket.onclose = (socketMessage) => {
    console.log("🔌 WebSocket closed", socketMessage);
    socket = null;
  };

  return socket;
};


export const disconnectSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "UNSUBSCRIBE" }));
    socket.close();
    socket = null;
    console.log("👋 Disconnected from WebSocket");
  }
};

export const emitSupportMessage = (messageText) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "SUPPORT_CHAT",
        message: messageText.trim(),
      })
    );
    console.log("📤 Support message sent:", messageText);
  } else {
    console.warn("❗ WebSocket not open. Message not sent.");
  }
};

export const getSocket = () => socket;
