import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { callGetAPI, callPostAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import { message, Spin } from "antd";
import SuccessModal from "../components/SuccessModal";

export default function DailyAttendance() {
    const navigate = useNavigate();
    const [cookies] = useCookies();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [messageText, setMessageText] = useState("");

    const [attendanceStatus, setAttendanceStatus] = useState([]);
    const [accumulatedBonus, setAccumulatedBonus] = useState(0);
    const [loading, setLoading] = useState(false);

    const token = cookies?.token;
    const userId = cookies?.userDetails?.userId;

    useEffect(() => {
        fetchAttendanceStatus();
    }, []);

    const fetchAttendanceStatus = async () => {
        if (token && userId) {
            try {
                setLoading(true);
                const res = await callGetAPI(
                    API_ENDPOINTS.GET_ATTENDANCE_STATUS(userId),
                    token
                );

                if (res?.success) {
                    setAttendanceStatus(res.attendanceStatus || []);
                    setAccumulatedBonus(res.accumulatedBonus || 0);
                } else {
                    message.error(res?.message || "Failed to fetch attendance");
                }
            } catch (error) {
                message.error("Failed to fetch attendance");
            } finally {
                setLoading(false);
            }
        }
    };

    const claimDailyBonus = async (dayNumber) => {
        if (token && userId) {
            try {
                setLoading(true);
                const res = await callPostAPI(
                    API_ENDPOINTS.CLAIM_DAILY_BONUS,
                    { userId },
                    token
                );

                if (res?.success) {
                    setMessageText(res.message);
                    setShowSuccessModal(true);
                    // Update the claimed status in the attendanceStatus list
                    setAttendanceStatus((prev) =>
                        prev.map((item) =>
                            item.dayNumber === dayNumber ? { ...item, claimed: true } : item
                        )
                    );
                    setAccumulatedBonus(res.accumulatedBonus);
                } else {
                    message.error(res?.message || "Failed to claim bonus");
                }
            } catch (error) {
                message.error("Failed to claim bonus");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="dAttendancePage">
            <div className="pageHeader">
                <img src="/images/dattendanceIcon.svg" alt="" width={40} />
                <span>Daily Attendance</span>
            </div>

            <div className="dapTopOuter">
                <div className="dapTop">
                    <div className="dapTopLeft">
                        <h4>
                            <img src="/images/giftIcon.svg" alt="" />
                            <span>Daily Attendance Bonus</span>
                        </h4>
                        <p>Get reward based on consecutive login day in the Game.</p>
                        <h5>Accumulated</h5>
                        <div className="dtlBottom">
                            <div className="dtbTag">
                                <div className="dtbTagInner">
                                    ₹ {accumulatedBonus.toFixed(2)}
                                </div>
                            </div>
                            <button onClick={() => navigate("/attendance-history")}>
                                Attendance History
                            </button>
                        </div>
                    </div>
                    <div className="dapTopRight">
                        <img src="/images/ggiftIcon.png" alt="" />
                    </div>
                </div>
            </div>

            {loading && !attendanceStatus?.length > 0 ? (
                <div
                    style={{
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Spin />
                </div>
            ) :
            (
                <div className="daysOffer" style={{position:"relative"}}>
                    {
                        loading ?
                            <div className='loadingOverData'>
                                <Spin size="large" tip="Loading" />
                            </div>
                            :null
                    }
                    <div className="dofLeft">
                        {attendanceStatus
                            ?.slice(0, 6)
                            ?.map(({ dayNumber, bonusAmount, claimed }) => (
                                <div
                                    key={dayNumber}
                                    className={`dofItemOuter ${claimed ? "claimed" : "clickable"
                                        }`}
                                    onClick={() =>
                                        !claimed && !loading && claimDailyBonus(dayNumber)
                                    }
                                    style={{ cursor: claimed ? "default" : "pointer" }}
                                >
                                    <div className="dofItemInner">
                                        <div className="dofItem">
                                            <img src="/images/offerGiftIcon.png" alt="" />
                                            <h4>₹{bonusAmount}</h4>
                                            <p>DAY {dayNumber}</p>
                                        </div>
                                    </div>
                                    {claimed && <div className="claimed">Claimed</div>}
                                </div>
                            ))}
                    </div>

                    <div className="dofRight">
                        {attendanceStatus[6] && (
                            <div
                                className={`dofItemOuter ${attendanceStatus[6].claimed ? "claimed" : "clickable"
                                    }`}
                                onClick={() =>
                                    !attendanceStatus[6].claimed &&
                                    !loading &&
                                    claimDailyBonus(attendanceStatus[6].dayNumber)
                                }
                                style={{
                                    cursor: attendanceStatus[6].claimed ? "default" : "pointer",
                                }}
                            >
                                <div className="dofItemInner">
                                    <div className="dofItem">
                                        <img src="/images/bigDay7Img.png" alt="" />
                                        <h4>₹{attendanceStatus[6].bonusAmount}</h4>
                                        <p>DAY 7</p>
                                    </div>
                                </div>
                                {attendanceStatus[6].claimed && (
                                    <div className="claimed">Claimed</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <SuccessModal
                    open={showSuccessModal}
                    setOpen={setShowSuccessModal}
                    messageText={messageText}
                />
            )}
        </div>
    );
}
