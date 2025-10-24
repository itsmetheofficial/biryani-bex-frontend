import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { callGetAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";

export default function BetCommission() {
    const navigate = useNavigate();
    const [cookies, setCookies] = useCookies();
    const [betCommissionData, setBetCommissionData] = useState([]);
    const [betCommissionRules, setBetCommissionRules] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBetCommissionData();
    }, []);

    const fetchBetCommissionData = async () => {
        setLoading(true);

        try {
            let res = await callGetAPI(
                API_ENDPOINTS.GET_BET_COMMISSION_LEVELS,
                cookies?.token
            );
            if (res?.success) {
                setBetCommissionData(res?.betCommissionLevels || []);
                setBetCommissionRules(res?.betCommissionRules || []);
            }
        } catch {
            setBetCommissionData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="betCommissionPage">
            <div className="pageHeader">
                <button onClick={()=>navigate(-1)} className="headerPrevButton">
                    <img src="/images/leftArrowFilled.svg" alt=""/>
                </button>
                <img src="/images/OffersPageIcon.svg" alt="" width={40} />
                <span>Bet Commission</span>
            </div>
            <div className="bcpTable">
                <div className="rowTable">
                    <div className="rtHeader">
                        <div className="rtTh reward">
                            <img src="/images/userfilledIcon.svg" alt="" width={19} />
                            Levels
                        </div>
                        <div className="rtTh topupValue">
                            <img src="/images/topupValueIcon.svg" alt="" width={30} />
                            Top-up Value
                        </div>
                    </div>
                    <div className="rtBody">
                        {loading ? (
                            <div className="rtTr">
                                <div
                                    className="rtTd topupValue"
                                    style={{ width: "100%", padding: 20 ,height:100}}
                                >
                                    <Spin />
                                </div>
                            </div>
                        ) : betCommissionData?.length > 0 ? (
                            betCommissionData?.map((rowData, index) => (
                                <div className="rtTr" key={rowData?._id || index}>
                                    <div className="rtTd topupValue">{rowData?.level}</div>
                                    <div className="rtTd reward">{rowData?.commission}%</div>
                                </div>
                            ))
                        ) : (
                            <div className="rtTr">
                                <div
                                    className="rtTd topupValue"
                                    style={{ width: "100%", padding: 20,height:100}}
                                >
                                    No Data Found!
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bcpRules">
                <h4>Bet Commission Rules</h4>
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
                ) : betCommissionRules?.length ? (
                    <ul>
                        {betCommissionRules?.map((rule) => (
                            <li>{rule}</li>
                        ))}
                    </ul>
                ) : (
                    <div
                        style={{
                            padding: 20,
                            color: "#fff",
                            height: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        No Rules found!
                    </div>
                )}
            </div>
        </div>
    );
}
