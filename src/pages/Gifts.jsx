import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useCookies } from "react-cookie";
import { callGetAPI, callPostAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import { useNavigate } from "react-router-dom";

export default function Gifts() {
  const navigate = useNavigate();
  const [cookies] = useCookies(["token", "userDetails"]);
  const [giftCode, setGiftCode] = useState("");
  const [claimedGifts, setClaimedGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading,setTableLoading] = useState(false);

  const userId = cookies?.userDetails?.userId;
  const token = cookies?.token;

  // 🔹 Fetch Claimed Gift Codes (API #21 from docs)
  const fetchClaimedGifts = async () => {
    if (!userId || !token) return;

    try {
      setTableLoading(true);
      const response = await callGetAPI(
        API_ENDPOINTS.GET_CLAIMED_GIFT_CODES(userId), 
        token
      );

      if (response?.status) {
        setClaimedGifts(response.data || []);
      } else {
        setClaimedGifts([]);
      }
    } catch (err) {
      message.error("Failed to fetch claimed gift codes");
    } finally {
      setTableLoading(false);
    }
  };

  // 🔹 Claim Gift Code
  const handleClaim = async () => {
    if (!giftCode) {
      message.error("Please enter a gift code");
      return;
    }

    try {
      setLoading(true);
      const response = await callPostAPI(
        API_ENDPOINTS.CLAIM_GIFT_CODE,
        { userId, code: giftCode },
        token
      );

      if (response?.status) {
        message.success(response.message || "Gift claimed successfully!");
        setGiftCode("");
        fetchClaimedGifts(); // refresh table
      } else {
        message.error(response.message || "Failed to claim gift");
      }
    } catch (err) {
      message.error("Error claiming gift");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimedGifts();
  }, [userId]);

  return (
    <div className="giftsPage">
      <div className="pageHeader">
        <button onClick={()=>navigate(-1)} className="headerPrevButton">
            <img src="/images/leftArrowFilled.svg" alt=""/>
        </button>
        <img src="/images/giftIcon.svg" alt="" width={50} />
        <span>Gift</span>
      </div>

      {/* Gift Banner */}
      <div className="giftBannerOuter">
        <div className="giftBanner">
          <div className="giftBannerInner">
            <h4>Hello</h4>
            <h5>We have a gift for you</h5>
            <div className="gbContent">
              <div className="gbcLeftImg">
                <img src="/images/gbcLeftImg.png" alt="" />
              </div>
              <div className="gbcRightImg">
                <img src="/images/gbcRightImg.png" alt="" />
              </div>
              <div className="gbContentInner">
                <p>Please Enter the Gift Code below</p>
                <input
                  type="text"
                  placeholder="Please Enter Gift Code Here"
                  value={giftCode}
                  onChange={(e) => e.target.value?.includes(" ") ?null : setGiftCode(e.target.value)}
                />
                <div className="gbcButtonOuter">
                  <button onClick={handleClaim} disabled={loading}>
                    {loading ? "Processing..." : "Claim"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gift Table */}
      <div className="giftTableContainer">
        <div className="giftTableLeftImg">
          <img src="/images/GiftLeftImage.png" alt="" />
        </div>
        <div className="giftTableRightImg">
          <img src="/images/GiftRightImage.png" alt="" />
        </div>
        <div className="rowTable">
          <div className="rtHeader">
            <div className="rtTh topupValue">
              <img src="/images/timeDateIcon.svg" alt="" width={25} />
              Time/Date
            </div>
            <div className="rtTh topupValue">
              <img src="/images/topupValueIcon.svg" alt="" width={30} />
              Amount
            </div>
            <div className="rtTh reward">
              <img src="/images/giftIcon.svg" alt="" width={22} />
              Gift Code
            </div>
          </div>
          <div className="rtBody">
            {tableLoading ? (
              <div className="rtTr">
                <div className="rtTd" style={{width:"100%",fontWeight:400}}>
                  Loading...
                </div>
              </div>
            ) : claimedGifts.length > 0 ? (
              claimedGifts.map((gift, index) => (
                <div className="rtTr" key={index}>
                  <div className="rtTd topupValue">
                    {new Date(gift.createdAt).toLocaleString()}
                  </div>
                  <div className="rtTd reward">₹{gift.amount}</div>
                  <div className="rtTd topupValue">{gift.code}</div>
                </div>
              ))
            ) : (
              <div className="rtTr">
                <div className="rtTd" style={{width:"100%",fontWeight:400}}>
                  No data found!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
