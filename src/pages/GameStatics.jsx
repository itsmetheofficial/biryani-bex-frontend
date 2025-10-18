import { message, Spin } from "antd"
import React, { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { callGetAPI } from "../api/apiHelper"
import { API_ENDPOINTS } from "../api/apiConfig"

export default function GameStatics() {
    const [cookies] = useCookies()
    const token = cookies?.token
    const userId = cookies?.userDetails?.userId

    const [filter, setFilter] = useState("today")
    const [data, setData] = useState({ totalBet: 0, gameWiseList: [] })
    const [loading, setLoading] = useState(false)

    const fetchStats = async (filterType = filter) => {
        if (!token || !userId) {
            message.error("Session expired. Please log in again.")
            return
        }
        setLoading(true)
        try {
            const params = { filter: filterType } // pass filter as param
            const res = await callGetAPI(API_ENDPOINTS.GET_BET_STATISTICS(userId), token, params)
            if (res?.success) {
                setData({
                    totalBet: res?.totalBet || 0,
                    gameWiseList: res?.gameWiseList || [],
                })
            } else {
                message.error(res?.message || "Failed to fetch statistics")
            }
        } catch (err) {
            message.error(err?.message || "An error occurred while fetching stats")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats(filter)
    }, [filter])

    return (
        <div className="gameStatics">
            <div className="pageHeader">
                <img src="/images/gamePageHeaderIcon.svg" alt="" width={50} />
                <span>Game Statistics</span>
            </div>

            <div className="totalBetSecOuter">
                <div className="totalBetSec">
                    <div className="tbCount">
                        <span>₹{data?.totalBet ||0}</span>
                    </div>
                    <div className="tbCountText">
                        <span>Total Bet</span>
                    </div>
                </div>
            </div>

            <div className="gsButtonsOuter">
                <div className="gsButtons">
                    {["today", "yesterday", "week", "month"].map((key) => (
                        <button
                            key={key}
                            className={filter === key ? "active" : ""}
                            onClick={() => setFilter(key)}
                        >
                            <span>{key === "today" ? "Today" :
                                key === "yesterday" ? "Yesterday" :
                                    key === "week" ? "This Week" :
                                        "This Month"}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="gsTable">
                <div className="tecTable">
                    <div className="tecHeader">
                        <div className="tehItem game">
                            <img src="/images/consoleIcon.svg" alt="" width={20} />
                            <span>Game</span>
                        </div>
                        <div className="tehItem noOFBets">
                            <img src="/images/wallettableIcon.svg" alt="" width={21} />
                            <span>Number of Bets</span>
                        </div>
                        <div className="tehItem totalBets">
                            <img src="/images/wallettableIcon.svg" alt="" width={21} />
                            <span>Total Bet</span>
                        </div>
                        <div className="tehItem winningAmount">
                            <img src="/images/trophyIcon.svg" alt="" width={18} />
                            <span>Winning Amount</span>
                        </div>
                    </div>
                    <div className="tecBody">
                        {loading ? (
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
                        ) : data?.gameWiseList?.length > 0 ? (
                            data.gameWiseList.map((row, index) => (
                                <div className="tecRowOuter" key={index}>
                                    <div className="tecRow">
                                        <div className="tecTd game">
                                            <span>{row?.game?.length > 0 ? row.game : "N/A"}</span>
                                        </div>
                                        <div className="tecTd noOfBets">
                                            <span>{row?.numberOfBet || 0}</span>
                                        </div>
                                        <div className="tecTd price totalBets">
                                            <span>₹{row?.totalBet || 0}</span>
                                        </div>
                                        <div className="tecTd winningAmount">
                                            <span
                                                className={`waOuter ${
                                                    row?.winningAmount === 0
                                                        ? "Zero"
                                                        : row?.winningAmount < 0
                                                        ? "Lost"
                                                        : ""
                                                }`}
                                            >
                                                {row?.winningAmount > 0
                                                    ? `+ ₹${row.winningAmount}`
                                                    : row?.winningAmount < 0
                                                    ? `- ₹${row?.totalBet}`
                                                    : "0"}
                                                {row?.status === "Lost" && `- ₹${row?.totalBet}`}
                                                {row?.status === "Failed" && "Failed"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                className="tecRow"
                                style={{
                                    justifyContent: "center",
                                    background: "#26364b",
                                    height: 100,
                                }}
                            >
                                <div
                                    className="tecTd attendanceTitle game"
                                    style={{ justifyContent: "center" }}
                                >
                                    No Data Found
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
