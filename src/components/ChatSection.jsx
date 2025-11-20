import { Button, message as antdMessage, Spin } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import {
  connectSocket,
  emitSupportMessage,
  callPostAPI,
  disconnectSocket,
  getSocket,
  callPostAPIMultipart,
} from "../api/apiHelper";
import { API_ENDPOINTS, BASE_URL } from "../api/apiConfig";
import { Cookies } from "react-cookie";
import { CloseOutlined, FileAddOutlined, LoadingOutlined, PaperClipOutlined } from "@ant-design/icons";

export default function ChatSection({ setIsChatOpen }) {
  const cookies = new Cookies();
  const token = cookies.get("token");

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "support",
      text: "Hi there! How can we help you today?",
      time: "10:01 AM",
    },
  ]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSocketLoading, setIsSocketLoading] = useState(true);

  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Handle Emoji
  const onEmojiClick = (event) => {
    if (event?.emoji) {
      setMessage((prev) => prev + event.emoji);
      setShowEmojiPicker(false);
    }
  };

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

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

  // ✅ Connect socket on mount
  useEffect(() => {
    const socket = connectSocket(token, (data) => {
      if (data) {
        const newMsg = {
          id: Date.now(),
          sender: "support",
          text: data?.message || "",
          mediaUrl: data?.fileUrl ? `${BASE_URL}/Images/${data.fileUrl}` : null,
          mediaType: data?.fileType || null,
          time: new Date(data?.createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prev) => [...prev, newMsg]);
      }
    });

    if (socket) {
      setIsSocketReady(true);
      setIsSocketLoading(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // disconnectSocket();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Handle file selection
// ✅ Handle file selection and upload immediately
const handleFileChange = async (e) => {
  const selected = e.target.files[0];
  if (!selected) return;

  if (!selected.type.startsWith("image/") && !selected.type.startsWith("video/")) {
    antdMessage.error("Only image or video files are allowed!");
    return;
  }

  const previewURL = URL.createObjectURL(selected);
  setFile({
    name: selected.name,
    type: selected.type,
    preview: previewURL,
    raw: selected,
    uploadedUrl: null,
    uploadedType: null,
  });

  // 🟢 Upload immediately after selection
  try {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("chatMedia", selected);

    const res = await callPostAPI(API_ENDPOINTS.UPLOAD_CHAT_MEDIA, formData, token, true);
    if (res?.success && res?.fileUrl) {
      setFile((prev) => ({
        ...prev,
        uploadedUrl: `${BASE_URL}/Images/${res.fileUrl}`,
        uploadedType: res.fileType,
      }));
    } else {
      throw new Error(res?.message || "File upload failed");
    }
  } catch (err) {
    antdMessage.error(err.message || "Upload failed");
    setFile(null);
  } finally {
    setIsUploading(false);
  }
};


  // ✅ Upload file to backend before sending message
  const uploadFile = async () => {
    if (!file?.raw) return null;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file.raw);

      const res = await callPostAPIMultipart(API_ENDPOINTS.UPLOAD_CHAT_MEDIA, formData, token, true);
      if (res?.success && res?.fileUrl) {
        return { fileUrl: res.fileUrl, fileType: res.fileType };
      } else {
        throw new Error(res?.message || "File upload failed");
      }
    } catch (err) {
      antdMessage.error(err.message || "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Send message via WebSocket
 // ✅ Send message via WebSocket
const sendMessage = async () => {
  if ((!message.trim() && !file) || isUploading) return;

  const socket = getSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    antdMessage.error("WebSocket not connected.");
    return;
  }

  const outgoing = {
    type: "SUPPORT_CHAT",
    message: message.trim(),
    ...(file?.uploadedUrl && {
      fileType: file.uploadedType,
      fileUrl: file.uploadedUrl,
    }),
  };

  socket.send(JSON.stringify(outgoing));

  const newMessage = {
    id: Date.now(),
    sender: "user",
    text: message,
    mediaUrl: file?.uploadedUrl ? `${file.uploadedUrl}` : file?.preview,
    mediaType: file?.uploadedType || file?.type?.split("/")[0],
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setChatMessages((prev) => [...prev, newMessage]);
  setMessage("");
  setFile(null);
};


  return (
    <div className="chat-section chatSectionOuter">
      <div className="chat-section">
        {/* Header */}
        <div className="csTopOuter">
          <div className="csTop">
            <div className="cstLeft">
              <div className="supportIcon">
                <img
                  src="/images/headphones-head-set-chat-live-support-svgrepo-com.svg"
                  alt="support"
                />
              </div>
              <div className="supportName">
                <p>Support Team</p>
                <small>{isSocketReady ? "Online" : "Not Connected"}</small>
              </div>
            </div>
            <div className="cstRight">
              <Button type="text" onClick={() => setIsChatOpen(false)}>
                <CloseOutlined />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="csChatArea">
          <div className="chatList">
            {chatMessages.map((msg) => (
              <div
                key={msg?.id}
                className={`chatItem ${msg?.sender === "user" ? "myMessage" : "supportMessage"}`}
              >
                <div className="ciContent">
                  {msg?.mediaType === "image" && (
                    <img src={msg?.mediaUrl} alt="chat-img" className="chat-media" />
                  )}
                  {msg?.mediaType === "video" && (
                    <video controls className="chat-media">
                      <source src={msg?.mediaUrl} type="video/mp4" />
                    </video>
                  )}
                  {msg?.text && <p>{msg?.text}</p>}
                  <span className="ciTime">{msg?.time}</span>
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


        {/* Bottom Input */}
        <div className="csBottom">
          {/* Preview */}
          {file && (
            <div className="media-preview">
                  {
                    isUploading ? (
                      <div className="uploading">
                        <Spin indicator={<LoadingOutlined spin />} />
                      </div>
                    ): 
                    <span className="removeMediaFile" onClick={() => setFile(null)}>
                      <CloseOutlined style={{fontSize:12,color:"#fff"}} />
                    </span>
                  }
                  {file.type.startsWith("image/") && (
                    <img src={file.preview} alt="preview" className="preview-media" />
                  )}
                  {file.type.startsWith("video/") && (
                    <video controls={false} className="preview-media">
                      <source src={file.preview} type={file.type} />
                    </video>
                  )}
                  
            </div>
          )}
          <div className="chatContainer">
            <div className="ccLeft">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message..."
                disabled={isUploading}
              />
              <div className="iconButtonContainer">
                <button ref={emojiButtonRef} className="iconButton" onClick={toggleEmojiPicker}>
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="emoji-tooltip">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                  <img src="/images/emojiIcon.png" alt="emoji" />
                </button>
                <button className="iconButton" onClick={() => fileInputRef.current.click()}>
                  <PaperClipOutlined style={{fontSize:20,color:"#757c8f"}}/>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  style={{ display: "none" }}
                />

              </div>
            </div>

            <div className="ccRight">
              <button className="sendButton" onClick={sendMessage} disabled={isUploading}>
                 <img src="/images/SendButton.svg" alt="send" />
                 {isUploading  ? <span><Spin indicator={<LoadingOutlined spin style={{fontSize:45}} />} style={{color:"#fff"}} /></span> : null}
              </button>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
