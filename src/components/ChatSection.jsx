import { Button, message as antdMessage, Spin } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../App";
import { Cookies } from "react-cookie";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";

export default function ChatSection({ setIsChatOpen }) {
  const socket = useContext(SocketContext);
  const cookies = new Cookies();
  const token = cookies.get("token");

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "support",
      text: "Hi there! How can we help you today?",
      time: "10:01 AM",
    },
  ]);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isSocketLoading, setIsSocketLoading] = useState(true);

  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const onEmojiClick = (event) => {
    if (event?.emoji) {
      setMessage((prevMessage) => prevMessage + event.emoji);
      setShowEmojiPicker(false);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (
      emojiButtonRef.current &&
      !emojiButtonRef.current.contains(event.target) &&
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  // 🧠 Handle incoming messages from socket
  useEffect(() => {
    if (!socket) {
      setIsSocketLoading(false);
      setIsSocketReady(false);
      console.error("WebSocket not connected.");
      return;
    }else if(socket?.readyState >0){
      setIsSocketReady(true);
      setIsSocketLoading(false);
      
    }
    console.log("socket : ",socket)

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WebSocket message:", data);

        if (data?.type === "CONNECTED") {
          socket.send(JSON.stringify({ type: "SUBSCRIBE" }));
        } else if (data?.message === "subscribed successfully." || data?.message === "You are already subscribed.") {
          setIsSocketReady(true);
        } else if (data?.type === "ADMIN_RESPONSE") {
          const incomingMessage = {
            id: Date.now(),
            sender: "support",
            text: data?.data?.message || "Support replied",
            time: new Date(data?.data?.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setChatMessages((prev) => [...prev, incomingMessage]);
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
        antdMessage.error("Failed to parse WebSocket message.");
      }finally{
          setIsSocketLoading(false);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      antdMessage.error("WebSocket connection error.");
      setIsSocketLoading(false);
    };

    socket.onclose = () => {
      setIsSocketReady(false);
      setIsSocketLoading(false);
      antdMessage.error("WebSocket disconnected.");
    };
    
    return () => {
      socket.removeEventListener("message", handleSocketMessage);
      socket.close();
      setIsSocketLoading(false);
    };
  }, [socket]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      antdMessage.error("WebSocket not connected.");
      return;
    }

    const outgoing = {
      type: "SUPPORT_CHAT",
      message: message.trim(),
    };

    socket.send(JSON.stringify(outgoing));
    console.log("📤 Message sent:", outgoing.message);

    const newMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  const _closeChatOnBlur =(e)=>{
  //        if(window.innerWidth<993){
  //           if(e.target?.classList?.contains("chatSectionOuter")){
  //                setIsChatOpen(false)
  //           }
  //       }
  //   }

  return (
      <div className="chat-section chatSectionOuter">
        <div className="chat-section">
          <div className="csTopOuter">
            <div className="csTop">
              <div className="cstLeft">
                <div className="supportIcon">
                  <img src="/images/headphones-head-set-chat-live-support-svgrepo-com.svg" alt="" />
                </div>
                <div className="supportName">
                  <p>Support Team </p>
                  <small>{isSocketReady ? "Online" : "Not Connected"}</small>
                </div>
              </div>
              <div className="cstRight">
                <Button type="text" onClick={() => setIsChatOpen(false)}>
                  {/* <img
                    src="/images/downArrowmultipleColor.png"
                    alt="Dropdown Arrow"
                  /> */}
                  <CloseOutlined />
                </Button>
              </div>
            </div>
          </div>

          <div className="csChatArea">
            <div className="chatList">
              {chatMessages.map((msg, index) => (
                <div
                  key={msg?.id || index}
                  className={`chatItem ${
                    msg?.sender === "user" ? "myMessage" : "supportMessage"
                  }`}
                >
                  <div className="ciContent">
                    <div className="ciText">
                      <p>{msg?.text || ""}</p>
                      <span className="ciTime">{msg?.time?.length>0 ?moment().format("HH:mm A"):"--/--"}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isSocketLoading && (
                <div className="chat-loading">
                  <Spin tip="Connecting..." />
                </div>
              )}
            </div>
          </div>

          <div className="csBottom">
            <div className="chatContainer">
              <div className="ccLeft">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                />
                <button
                  ref={emojiButtonRef}
                  className="emojiButton"
                  onClick={toggleEmojiPicker}
                  aria-label="Show Emoji Picker"
                >
                  <img src="/images/emojiIcon.png" alt="" />
                </button>
              </div>
              <div className="ccRight">
                <button className="sendButton" onClick={sendMessage}>
                  <img src="/images/SendButton.svg" alt="" />
                </button>
              </div>
            </div>

            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="emoji-tooltip">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
