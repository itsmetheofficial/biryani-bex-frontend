import { message, Pagination, Spin } from 'antd';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../api/apiConfig';
import { useCookies } from 'react-cookie';
import { callGetAPI } from '../api/apiHelper';
import moment from 'moment';

export default function Promotions() {
    const navigate = useNavigate();
    const [cookies,setCookies] = useCookies();
    console.log("cookies : ",cookies)
    const [tableData,settableData]= useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [dashboardData,setDashboardData] = useState({});
    const [loading,setLoading] = useState({tableData:false,dashboardData:false});
    const itemsPerPage = 5;

    const token = cookies?.token;
    const userId = cookies?.userDetails?.userId;

    useEffect(()=>{
        fetchRefferalDashboard();
    },[])
    
    useEffect(()=>{
        fetchSubOrdinatesData();
    },[currentLevel])
    
    
    const fetchRefferalDashboard = async()=>{
        setLoading((prev)=>({...prev,dashboardData:true}));
        try{
            const res = await callGetAPI(API_ENDPOINTS.GET_REFERRAL_DASHBOARD(userId), token);
            if(res?.success){
                setDashboardData(res?.data);
            }else{
                setDashboardData({})
                message.err(res?.message || "Something went wrong");
            }
        }catch{
            setDashboardData({});
            message?.error("Something went wrong");
        }finally{
            setLoading((prev)=>({...prev,dashboardData:false}));
        }
    }

    const fetchSubOrdinatesData = async () => {
        setLoading((prev) => ({ ...prev, tableData: true }));
        try {
            const response = await callGetAPI(API_ENDPOINTS.GET_REFERRAL_STATS_NEW(userId), token, {level:currentLevel});
            if (response?.success) {
                settableData(response?.data || []);
            } else {
                message.error(response?.message || 'Failed to fetch data');
            }
        } catch (err) {
            message.error('Something went wrong');
        } finally {
            setLoading((prev) => ({ ...prev, tableData: false }));
        }
    };
    
    const onPageChange = (page) => {
        setCurrentPage(page);
    };
    
    const copyToClipboard = async (text) => {
        if (typeof window === "undefined" || typeof navigator === "undefined") {
            console.warn("Clipboard not available in this environment.");
            return;
        }
    
        message.success("Copied to clipboard!");
        if (navigator.clipboard && window.isSecureContext) {
            try {
                console.log("working : ",window.isSecureContext)
                await navigator.clipboard.writeText(text);
            } catch (err) {
                message.error("Failed to copy!");
            }
        } else {
            message.warning("Clipboard copy not supported in this environment.");
        }
    };

  return (
    <div className="promotionPage">
        <div className="pageHeader">
            <button onClick={()=>navigate(-1)} className="headerPrevButton">
                <img src="/images/leftArrowFilled.svg" alt=""/>
            </button>
            <img src="/images/promotionIcon.svg" alt="" width={50} />
            <span>Promotions</span>
        </div>
        <div style={{position:"relative"}}>
            {
                loading?.dashboardData ?
                    <div className='loadingOverData'>
                        <Spin size="large" tip="Loading" />
                    </div>
                :null
            }
            <div className="ppTop">
                <div className="pptLeft">
                    <div className="pptLeftInner">
                        <div className="ptlPrice">
                            <span>₹{dashboardData?.yesterdayCommission || 0}</span>
                        </div>
                        <div className="ptlContent">
                            <p>Yesterday’s  Total Commission</p>
                        </div>
                        <div className="ptlInfo">
                            <p>Upgrade the level to increase commission income</p>
                        </div>
                    </div>
                </div>
                <div className="pptMid pptLeft ">
                    <div className="pptMidInner">
                        <div className="ptmItem">
                            <div className="pmITop">
                                <img src="/images/multiuserIcon.svg" alt="" />
                                <span>Direct Subordinates</span>
                            </div>
                            <div className="pmIContent">
                                <div className="pmcItem">
                                    <span>{dashboardData?.directSubordinates?.registered || 0}</span>
                                    <p>Number of register</p>
                                </div>
                                <div className="pmcItem green">
                                    <span>{dashboardData?.directSubordinates?.depositUsers || 0}</span>
                                    <p>Deposit number</p>
                                </div>
                                <div className="pmcItem yellow">
                                    <span>{dashboardData?.directSubordinates?.depositAmount || 0}</span>
                                    <p>Deposit amount</p>
                                </div>
                                <div className="pmcItem">
                                    <span>{dashboardData?.directSubordinates?.firstDepositUsers || 0}</span>
                                    <p>Number of people making first deposit</p>
                                </div>
                            </div>
                            
                        </div>
                        <div className="ptmItem">
                            <div className="pmITop">
                                <img src="/images/multiuserIcon.svg" alt="" />
                                <span>Team Subordinates</span>
                            </div>
                            <div className="pmIContent">
                                <div className="pmcItem">
                                    <span>{dashboardData?.teamSubordinates?.registered || 0}</span>
                                    <p>Number of register</p>
                                </div>
                                <div className="pmcItem green">
                                    <span>{dashboardData?.teamSubordinates?.depositUsers || 0}</span>
                                    <p>Deposit number</p>
                                </div>
                                <div className="pmcItem yellow">
                                    <span>{dashboardData?.teamSubordinates?.depositAmount || 0}</span>
                                    <p>Deposit amount</p>
                                </div>
                                <div className="pmcItem">
                                    <span>{dashboardData?.teamSubordinates?.firstDepositUsers || 0}</span>
                                    <p>Number of people making first deposit</p>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div className="pptRight">
                    <div className="mwrBottom mbButtons">
                        <button onClick={()=>navigate("/subordinate-data")}>
                            <img src="/images/Subordinate.svg" alt="" />
                            <span>Subordinate</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="ppOffer">
                <div className="ppOfferInner">
                    <div className="ppoTop">
                        <img src="/images/addUser.svg" alt="" />
                        <p>Invite your friends get interesting commissiion and bonuse as reward.</p>
                    </div>
                    <div className="ppoLinks">
                        {/* <div className="polLinkItem">
                            <p>Invite your friend here:</p>
                            <button>
                                <img src="/images/shareIcon.svg" alt="" />
                                <span>Invite your friend</span>
                            </button>
                        </div> */}
                        <div className="polLinkItem">
                            <p>Copy link and invite your friend</p>
                            <div className='pliButton'>
                            <span>{window.location.origin+"/sign-up?referralCode="+cookies?.userDetails?.referralCode}</span>
                                <button onClick={()=>copyToClipboard(window.location.origin+"/sign-up?referralCode="+cookies?.userDetails?.referralCode)}>
                                    <img src="/images/copyIcon.png" alt="" />
                                </button>
                            </div>
                        </div>
                        <div className="polLinkItem">
                            <p>Copy Code and invite your friend</p>
                            <div className='pliButton'>
                                <span>{cookies?.userDetails?.referralCode||"-"}</span>
                                <button onClick={()=>copyToClipboard(cookies?.userDetails?.referralCode||"-")}>
                                    <img src="/images/copyIcon.png" alt="" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="promotionGift">
                    <img src="/images/promotionGift.png" alt="" />
                </div>
            </div>

        </div>
        <div className="ppTableButtons">
            <div className="ptbLeft">
                <div className={`ptbLeftItemOuter ${currentLevel===1?"active":""}`} onClick={()=>setCurrentLevel(1)}>
                    <div className="ptbLeftItem">
                        <div className="ptbLeftItemInner">
                            <p>Level 1</p>
                            <div>
                                <img src="/images/multiusercoloricon.svg" alt="" />
                                <span>{dashboardData?.levelStats?.level1Count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`ptbLeftItemOuter ${currentLevel===2?"active":""}`} onClick={()=>setCurrentLevel(2)}>
                    <div className="ptbLeftItem">
                        <div className="ptbLeftItemInner">
                            <p>Level 2</p>
                            <div>
                                <img src="/images/multiuserdefaultIcon.svg" alt="" />
                                <span>{dashboardData?.levelStats?.level2Count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`ptbLeftItemOuter ${currentLevel===3?"active":""}`} onClick={()=>setCurrentLevel(3)}>
                    <div className="ptbLeftItem">
                        <div className="ptbLeftItemInner">
                            <p>Level 3</p>
                            <div>
                                <img src="/images/multiuserdefaultIcon.svg" alt="" />
                                <span>{dashboardData?.levelStats?.level3Count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ptbRightOuter">
                <div className="ptbRight">
                    <div className="ptbrItem">
                        <h4>Total Team</h4>
                        <div className="ptbrTagOuter">
                            <div className="ptbrTag">
                                <img src="/images/multiuserIcon.svg" alt="" width={20} />
                                <span>{dashboardData?.promotionData?.totalTeamSubordinates || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ptbrItem">
                        <h4>Total Commission</h4>
                        <div className="ptbrTagOuter">
                            <div className="ptbrTag">
                                <img src="/images/ruppeIcon.svg" alt="" width={18} />
                                <span>{dashboardData?.promotionData?.totalCommission || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ptbrItem">
                        <h4>Total Income</h4>
                        <div className="ptbrTagOuter">
                            <div className="ptbrTag">
                             <img src="/images/ruppeIcon.svg" alt="" width={18} />
                                <span>{dashboardData?.promotionData?.totalCommission || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="ppTableData">
            <div className="gsTable">
                    <div className="tecTable">
                        <div className="tecHeader">
                            <div className="tehItem userId">
                                <img src="/images/userfilledIcon.svg" alt="" width={16} />
                                <span>User ID</span>
                            </div>
                            {/* <div className="tehItem refer">
                                <img src="/images/whiteShareIcon.svg" alt="" width={14} />
                                <span>Refer Code</span>
                            </div> */}
                            <div className="tehItem timeDate">
                                <img src="/images/timeDateIcon.svg" alt="" width={20} />
                                <span>Time/Date</span>
                            </div>
                            <div className="tehItem commission winningAmount">
                                <img src="/images/wallettableIcon.svg" alt="" width={21} />
                                <span>Commission <br /> Income</span>
                            </div>
                            <div className="tehItem winningAmount bonus">
                                <img src="/images/wallettableIcon.svg" alt="" width={18} />
                                <span>Bonus <br /> Income</span>
                            </div>
                        </div>
                        <div className="tecBody">
                            {
                                loading?.tableData ?
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
                                :
                                    tableData?.length > 0 ?
                                        tableData.map((rowData) => (
                                            <div className="tecRowOuter">
                                                <div className="tecRow">
                                                <div className="tecTd user">
                                                        {/* <div className="tecUserData">
                                                            <div className="tudIcon">
                                                                <img src="/images/tableUserDaaaa.png" alt="" />
                                                            </div>
                                                            <div className="tudRight">
                                                                <p>Aarav Sharma</p>
                                                                <span>@AKL200</span>
                                                            </div>
                                                        </div> */}
                                                        {rowData?.userId}
                                                    </div>
                                                    {/* <div className="tecTd orderId ">
                                                        <span>6080GHX302990</span>
                                                    </div> */}
                                                    <div className="tecTd game dateTime">
                                                        <span>{rowData?.time||"-"}</span>
                                                    </div>
                                                    <div className="tecTd price commission">
                                                        <span>₹{rowData?.commission}</span>
                                                    </div>
                                                    <div className="tecTd price bonus">
                                                        <span>₹{rowData?.depositAmount||0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                : <div style={{
                                        height:100,
                                        display:"flex",
                                        alignItems:"center",
                                        justifyContent:"center",
                                        color:"#fff"
                                    }}>
                                        No data found!
                                    </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="gsPagination">
                    <Pagination
                        current={currentPage}
                        pageSize={itemsPerPage}
                        total={tableData?.length || 0}
                        onChange={onPageChange}
                        showSizeChanger={false}
                        hideOnSinglePage={false} 
                        itemRender={(current, type, originalElement) => {
                            if (type === 'prev') {
                            return <a>Previous</a>;
                            }
                            if (type === 'next') {
                            return <a>Next</a>;
                            }
                            if (type === 'page') {
                            return <a>{current}</a>;
                            }
                            return originalElement;
                        }}
                        />
                </div>
        </div>
    </div>
  )
}
