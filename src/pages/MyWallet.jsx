import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VeiwDetailsModal from '../components/VeiwDetailsModal';
import SuccessModal from '../components/SuccessModal';
import { API_ENDPOINTS } from '../api/apiConfig';
import { callGetAPI, fetchUserDetailsHelper } from '../api/apiHelper';
import { message, Spin } from 'antd';
import { useCookies } from 'react-cookie';
import moment from 'moment';

export default function MyWallet() {
    const navigate = useNavigate();
    const [cookies,setCookies] = useCookies();

    const [showSuccessModalVisible, setShowSuccessModalVisible] = useState(false);
    const [depositDetialsModalVisible, setdepositDetialsModalVisible] = useState(false);
    const [selectedDepoiteEntry, setselectedDepoiteEntry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshBalanceLoading, setRefreshBalanceLoading] = useState(false);

    const [recentTransectionList, setrecentTransectionList] = useState([]);

    useEffect(()=>{
        fetchTransactions();
        _refreshBalance();
    },[])

    const handleTransferBonus = () => {
        // if (bonusWalletBalance > 0) {
        //     setMainWalletBalance(prev => prev + bonusWalletBalance);
        //     setBonusWalletBalance(0);
        //     setShowSuccessModalVisible(true);

        //     setTimeout(() => {
        //         setShowSuccessModalVisible(false)
        //     }, 2000);
        // }
    };

     const fetchTransactions = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", 1);
            params.append("limit", 10);
            params.append("userId", cookies?.userDetails?.userId);

            const url = `${API_ENDPOINTS.GET_ALL_TRANSACTIONS}?${params.toString()}`;

            const response = await callGetAPI(url, cookies.token);

            if (response?.success) {
                setrecentTransectionList(response?.transactions || []);
            } else {
                setrecentTransectionList([]);
                message.error(response?.message || "Failed to fetch transactions");
            }
        } catch (error) {
            console.error("Fetch Transactions Error:", error);
            message.error("Something went wrong while fetching transactions");
        } finally {
            setLoading(false);
        }
    };

    const _refreshBalance =async()=>{
        setRefreshBalanceLoading(true);
        try{
            let res = await fetchUserDetailsHelper(cookies?.userDetails?.userId);
        }catch{
            message.error("Failed to refresh balance");
        }finally{
            setRefreshBalanceLoading(false);
        }

    }

    return (
        <div className="myWalletPage">
            <div className="pageHeader">
                <button onClick={()=>navigate(-1)} className="headerPrevButton">
                    <img src="/images/leftArrowFilled.svg" alt=""/>
                </button>
                <img src="/images/walletHeaderIcon.svg" alt="" width={42} />
                <span>Wallet</span>
            </div>

            <div className="mwTop">
                <div className="mwtLeft">
                    <div className="mwlTopOuter">
                        <div className="mwlTop">
                            <div className="mwtText">
                                <img src="/images/newWalletIcon.svg" alt="" />
                                <span>Wallet Balance</span>
                            </div>
                            <div className="mwtBalanceOuter">
                                <div className="mwtBalance">
                                    <span>₹ {cookies?.userDetails?.mainWallet>0 ? cookies?.userDetails?.mainWallet.toFixed(2):0}</span>
                                    <button onClick={_refreshBalance}>
                                        <img src="/images/refreshBalanceIcon.svg" alt="" className={refreshBalanceLoading?"rotating-wheel":""} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mwlButtons">
                        <button onClick={() => navigate("/deposit")}>
                            <span>
                                <img src="/images/plusIconNew.svg" alt="" />
                                Deposit
                            </span>
                        </button>
                        <button onClick={() => navigate("/withdraw")}>
                            <span>
                                <img src="/images/withdrwalIcon.svg" alt="" />
                                Withdraw
                            </span>
                        </button>
                    </div>
                </div>

                {/* <div className="mwtMid"> */}
                    {/* <div className="mwtLeft">
                        <div className="mwlTopOuter">
                            <div className="mwlTop">
                                <div className="mwtText">
                                    <img src="/images/giftIcon.svg" alt="" />
                                    <span>Wallet Bonus</span>
                                </div>
                                <div className="mwtBalanceOuter">
                                    <div className="mwtBalance">
                                        <span>₹ {cookies?.userDetails?.bonusWallet>0 ? cookies?.userDetails?.bonusWallet.toFixed(2):0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mwlText">
                            <p>If you want to withdraw this bonus please read the rules bonus amount</p>
                        </div>
                        <div className="mwlButtons">
                            <button onClick={handleTransferBonus}>
                                <span>
                                    <img src="/images/transferIcon.svg" alt="" />
                                    Transfer to Main Wallet
                                </span>
                            </button>
                            <button className='mwlRulesButton' onClick={() => navigate("/rules")}>Read Rules</button>
                        </div>
                    </div> */}
                {/* </div> */}

                <div className="mwtRight">
                    <div className="mwrTop mbButtons">
                        <button onClick={() => navigate("/add-account-details")}>
                            <img src="/images/addBankIcon.svg" alt="" />
                            <span>Add Bank/UPI</span>
                        </button>
                    </div>
                    <div className="mwrBottom mbButtons">
                        <button onClick={() => navigate("/deposit-history")}>
                            <img src="/images/depositIIcon.svg" alt="" />
                            <span>Deposit History</span>
                        </button>
                        <button onClick={() => navigate("/withdraw-history")}>
                            <img src="/images/withdrwalHistoryIcon.svg" alt="" />
                            <span>Withdraw History</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mwPreTableHeader">
                <h4>Recent Transaction</h4>
                <div className="mbButtons">
                    <button onClick={() => navigate("/all-transactions")}>
                        <span>View All Transaction</span>
                        <img src="/images/Polygon 2.png" alt="" />
                    </button>
                </div>
            </div>

            <div className="mwTable">
                <div className="gsTable">
                    <div className="tecTable">
                        <div className="tecHeader">
                            <div className="tehItem type">
                                <img src="/images/addBankIcon.svg" alt="" width={18} />
                                <span>Type</span>
                            </div>
                            <div className="tehItem orderId">
                                <img src="/images/orderIdIcon.svg" alt="" width={20} />
                                <span>Order ID</span>
                            </div>
                            <div className="tehItem timeDate">
                                <img src="/images/timeDateIcon.svg" alt="" width={20} />
                                <span>Time/Date</span>
                            </div>
                            <div className="tehItem dipositeWithdrwal">
                                <img src="/images/depositWithrwalIcon.svg" alt="" width={26} />
                                <span>Deposit/<br /> Withdraw</span>
                            </div>
                            <div className="tehItem balance">
                                <img src="/images/depositIIcon.svg" alt="" width={24} />
                                <span>Balance</span>
                            </div>
                            <div className="tehItem status">
                                <img src="/images/statusIcon.svg" alt="" width={20} />
                                <span>Status</span>
                            </div>
                        </div>
                        <div className="tecBody">
                            {
                                loading ?

                                    <div
                                        style={{
                                            height: 100,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width:"100%"
                                        }}
                                    >
                                        <Spin />
                                    </div>

                                :
                                recentTransectionList.length > 0 ?
                                    recentTransectionList.map((rowData, index) => (
                                        <div className="tecRowOuter" key={index}>
                                            <div className="tecRow">
                                                <div className="tecTd type">
                                                    {
                                                        rowData?.transactionType?.length>0 ?
                                                        <span className="tag">{rowData?.transactionType }</span>
                                                        :null
                                                    }
                                                    <span>{rowData?.paymentMode || "N/A"}</span>
                                                </div>
                                                {/* <div className="tecTd orderId">
                                                    <span>{rowData.orderId}</span>
                                                </div> */}
                                                <div className="tecTd game dateTime">
                                                    <span>{rowData?.createdAt?.length>0 ? moment(rowData?.createdAt).format("YYYY-MM-DD HH:mm:ss") : "N/A"}</span>
                                                </div>
                                                <div className="tecTd price depositWithdrwal">
                                                    <span>{rowData?.amount ||0}</span>
                                                </div>
                                                <div className="tecTd balance">
                                                    <span>{rowData?.remainingBalance ||0}</span>
                                                </div>
                                                <div className={`tecTd status ${rowData.status}`}>
                                                    <span className="tecTdTag">{rowData.status}</span>
                                                    <button onClick={() => {
                                                        setselectedDepoiteEntry(rowData);
                                                        setdepositDetialsModalVisible(true);
                                                    }}>
                                                        <img src="/images/eyeButtonIcon.svg" alt="" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                : (
                                    <div style={
                                        {
                                            padding: 20,
                                            color: "#fff",
                                            height:100,
                                            display:"flex",
                                            alignItems:"center",
                                            justifyContent:"center"
                                        }
                                    }>
                                        No data found!
                                    </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {depositDetialsModalVisible &&
                <VeiwDetailsModal
                    open={depositDetialsModalVisible}
                    closeModal={() => {
                        setdepositDetialsModalVisible(false);
                        setselectedDepoiteEntry(null);
                    }}
                    record={selectedDepoiteEntry}
                />
            }

            {showSuccessModalVisible &&
                <SuccessModal
                    open={showSuccessModalVisible}
                    setOpen={setShowSuccessModalVisible}
                    messageText={"Bonus transferred to main wallet"}
                />
            }
        </div>
    );
}
