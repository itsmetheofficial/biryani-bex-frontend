import React, { useEffect, useState } from 'react'
import { redirect, useNavigate } from 'react-router-dom'
import DepositSucesssModal from '../components/DepositSucesssModal'
import DepositeFailedModal from '../components/DepositeFailedModal'
import VeiwDetailsModal from '../components/VeiwDetailsModal';
import { useCookies } from 'react-cookie';
import { callGetAPI, callPostAPI, fetchUserDetailsHelper } from '../api/apiHelper';
import { API_ENDPOINTS } from '../api/apiConfig';
import { message, Select, Spin } from 'antd';
import moment from 'moment';

export default function DepositPage() {
    const navigate = useNavigate()
    const [cookies,setCookies] = useCookies();
    const [filteredDdepositHistory,setFilteredDepositHistory] = useState([])
    const [paymentType,setpaymentType] = useState("payFromUPI");
    const [depositAmount,setdepositAmount] = useState(100);
    const [usdtAmount,setUsdtAmount] = useState(1);
    const [depositSuccessVisible,setDepositSuccessVisible] = useState(false);
    const [depositAlertData,setDepositeAlertData] = useState({});
    const [depositeFailedVisible,setDepositeFailedVisible] = useState(false);
    const [depositDetialsModalVisible, setdepositDetialsModalVisible] = useState(false);
    const [selectedDepoiteEntry, setselectedDepoiteEntry] = useState(null);
    const [depositRules,setDepositRules] = useState(null);
    const [paymentRulesToShow,setpaymentRulesToShow] = useState([]);
    const [depositHistory,setDepositHistory] = useState([]);
    const [upiList,setupiList] = useState([]);
    const [usdtList,setusdtList] = useState([]);
    const [usdtConversionRate,setusdtConversionRate] = useState(100);
    const [selectedUpi, setselectedUpi] = useState(null);
    const [selectedUsdt, setselectedUsdt] = useState(null);
    const [minimumDepositAmount,setMinimumDepositAmount] = useState(100);
    const [bonusData,setBonusData] = useState(null)
    const [loading,setLoading] = useState({
        tableLoading:false,
        rulesLoading:false,
        upiListLoading:false,
        usdtListLoading:false,
        refreshLoading:false,
        payFromUPiLoading:false
    });

    
    useEffect(()=>{
        if(cookies?.token){
            fetchgetDepositBonus()
        }
    },[cookies?.token])

    useEffect(()=>{
        // let udpatedData = depositHistory?.filter((data)=>data?.paymentMethod?.toLowerCase()===paymentType?.toLowerCase());
        let updatedData = depositHistory;
        setFilteredDepositHistory(updatedData)
    },[paymentType,depositHistory])

    useEffect(()=>{
        if(cookies?.token){
            fetchDepositRules(cookies?.token)
            fetchTransactions(cookies?.token)
        }
    },[cookies?.token])

    useEffect(()=>{
        if(paymentType?.length>0 && depositRules){
            if(paymentType==="payFromUPI"){
                setpaymentRulesToShow(depositRules?.manualDepositRules);
                setdepositAmount(depositRules?.depositMinimumAmount?.payFromUpi);
                setMinimumDepositAmount(depositRules?.depositMinimumAmount?.payFromUpi);
            } else if(paymentType==="upi"){
                setpaymentRulesToShow(depositRules?.payFromUpiDepositRules)
                setdepositAmount(depositRules?.depositMinimumAmount?.manualUpi);
                setMinimumDepositAmount(depositRules?.depositMinimumAmount?.manualUpi);
                if(upiList?.length===0){
                    fetchUPIList(cookies?.token)
                }
            } else if(paymentType==="usdt"){
                setpaymentRulesToShow(depositRules?.usdtDepositRules)
                setdepositAmount(depositRules?.depositMinimumAmount?.usdt);
                setMinimumDepositAmount(depositRules?.depositMinimumAmount?.usdt);
                if(usdtList?.length===0){
                    fetchUSDTList(cookies?.token)
                }
            }
        }
    },[depositRules,paymentType])

    const fetchDepositRules = async(token) =>{
        setLoading((prev)=>({...prev,rulesLoading:true}));
        const res = await callGetAPI(API_ENDPOINTS?.GET_DEPOSITE_RULES,token);
        if(res?.success){
            setDepositRules(res?.data)
        }else{
            setDepositRules({})
        }
        setLoading((prev)=>({...prev,rulesLoading:false}));
    }

    const fetchgetDepositBonus = async () => {
        try {
            const response = await callGetAPI(API_ENDPOINTS.GET_DEPOSITE_BONUS, cookies?.token,{});
            setBonusData(response?.depositBonus||null)
        } catch (error) {
            console.error('Error fetching deposit bonus:', error);
            return null;
        }
    }

     const fetchTransactions = async (token) => {
        try {
        setLoading((prev)=>({...prev,tableLoading:true}))

        const response = await callGetAPI(API_ENDPOINTS.GET_ALL_TRANSACTIONS, token,{page:1,limit:1000,transactionType:"Deposit",userId:cookies?.userDetails?.userId});

        if (response?.success) {
            setDepositHistory(response?.transactions || []);
        } else {
            setDepositHistory([]);
            message.error(response?.message || "Failed to fetch transactions");
        }
        } catch (error) {
            message.error("Failed to fetch transactions");
        } finally {
            setLoading((prev)=>({...prev,tableLoading:false}))
        }
    };

    const fetchUPIList =async(token)=>{
        setLoading((prev)=>({...prev,upiListLoading:true}));
        try{
            const res = await callGetAPI(API_ENDPOINTS.GET_UPI_LIST,token);
            if(res?.success){
                setupiList(res?.upiList)
                if(res?.upiList?.length>=1){
                    setselectedUpi(res?.upiList[0])
                }
            }else{
                setupiList([])
            }
        }catch{
            setupiList([])
            message.error("Failed to fetch upi list");
        }finally{
            setLoading((prev)=>({...prev,upiListLoading:false}));            
        }
    }

    const fetchUSDTList =async(token)=>{
        setLoading((prev)=>({...prev,usdtListLoading:true}));
        try{
            const res = await callGetAPI(API_ENDPOINTS.GET_USDT_WALLET_LIST,token);
            if(res?.success){
                setusdtList(res?.usdtWalletList)
                setusdtConversionRate(res?.usdtConversionRate)
                if(res?.usdtWalletList?.length>=1){
                    setselectedUsdt(res?.usdtWalletList[0])
                }
            }else{
                setusdtList([])
            }
        }catch{
            setusdtList([])
            message.error("Failed to fetch usdt list");
        }finally{
            setLoading((prev)=>({...prev,usdtListLoading:false}));
        }
    }

    const _changePaymentType =(type)=>{
        setpaymentType(type)
    }
    const _changeDepostAmount =(amount)=>{
        setdepositAmount(amount)
        setUsdtAmount(amount/usdtConversionRate)
    }
    const _depositInputChange =(e)=>{
        if(e.target.value?.length>0 || !isNaN(e.target.value)){
            if(!isNaN(e.target.value)){
                setdepositAmount(parseInt(e.target.value))
                setUsdtAmount(parseFloat(parseInt(e.target.value)/usdtConversionRate).toFixed(2))
            }
        }
    }
    const _changeUsdtAmount =(e)=>{
        if(e.target.value?.length>0 || !isNaN(e.target.value)){
            if(!isNaN(e.target.value)){
                setUsdtAmount(parseInt(e.target.value))
                setdepositAmount(parseInt(e.target.value)*usdtConversionRate)
            }
        }
    }

    const _refreshBalance =async()=>{
        setLoading((prev)=>({...prev,refreshLoading:true}));
        try{
            let res = await fetchUserDetailsHelper(cookies?.userDetails?.userId);
        }catch{
            message.error("Failed to refresh balance");
        }finally{
            setLoading((prev)=>({...prev,refreshLoading:false}));
        }

    }

    const _DepositeAmountSubmit = async() =>{
        if(paymentType==="payFromUPI" ){
            if(depositAmount < depositRules?.depositMinimumAmount?.payFromUpi){
                message.error("Deposit amount should be greater than ₹"+depositRules?.depositMinimumAmount?.payFromUpi)
            }else{

                setLoading((prev)=>({...prev,payFromUPiLoading:true}));
                try{
                    let payload ={
                        userId:cookies?.userDetails?.userId,
                        amount:depositAmount,
                        redirect_url:window.location.href
                    }
                    let res = await callPostAPI(API_ENDPOINTS.PAY_FROM_UPI, payload,cookies?.token);
    
                    if(res?.data?.data?.paymentLink){
                        // navigate(res?.data?.paymentLink);
                        window.location = res?.data?.data?.paymentLink
                        // let alertData = {
                        //     message: res?.data?.message || "Deposit Successful",
                        //     amount:depositAmount,
                        //     page:"Deposit"
                        // }
                        // setDepositeAlertData(alertData);
                        // setDepositSuccessVisible(true)
                        // setTimeout(() => {
                        //     setDepositSuccessVisible(false)
                        // }, 3000);                    
                    }else{
                        message.error(res?.message || "Failed to deposit")
                    }
                }catch{
                    message.error("Failed to deposit")
                }finally{
                    setLoading((prev)=>({...prev,payFromUPiLoading:false}));
                }
            }
        } else if(paymentType==="upi"){
            if(depositAmount < depositRules?.depositMinimumAmount?.manualUpi){
                message.error("Deposit amount should be greater than ₹"+depositRules?.depositMinimumAmount?.manualUpi)
            }else if(!selectedUpi?.upiId?.length>0){
                message.error("No UPI account available at this moment!");
            }else{
                navigate(`/upi-deposit?amount=${depositAmount}&upi=${selectedUpi?.upiId}&upiname=${selectedUpi?.upiHolderName}`);
            }
        }
        else if(paymentType==="usdt"){            
             if(depositAmount < depositRules?.depositMinimumAmount?.usdt){
                message.error("Deposit amount should be greater than ₹"+depositRules?.depositMinimumAmount?.usdt)
            }else if(!selectedUsdt?.usdtAddress?.length>0){
                message.error("No USDT account available at this moment!");
            }
            else{
                navigate(`/usdt-deposit?amount=${depositAmount}&usdtWalletAddress=${selectedUsdt?.usdtAddress}&label=${selectedUsdt?.label}`);
            }
        }
    }

    return (
        <div className="depositPage">
            <div className='aboutUsPage'>
            {
                loading.payFromUPiLoading ?
                    <div className='loadingOverData' style={{position:"fixed"}}>
                        <Spin size="large" tip="Loading" />
                    </div>
                    :null
            }
                <div className="auHeaderOuter">
                    <div className="auHeader">
                        <span>Deposit</span>
                        <button onClick={() =>  navigate(-1)}>
                            <img src="/images/closeModalIcon.png" alt="" />
                        </button>
                    </div>
                </div>
                <div className="dpWrapper">
                    <div className="dpTop">
                        <div className="mwtLeft">
                            <div className="mwlTopOuter">
                                <div className="mwlTop">
                                    <div className="mwtText">
                                        <img src="/images/newWalletIcon.svg" alt="" />
                                        <span>Balance</span>
                                    </div>
                                    <div className="mwtBalanceOuter">
                                        <div className="mwtBalance">
                                            <span>₹ {isNaN(cookies?.userDetails?.mainWallet) ? 0 :parseFloat(cookies?.userDetails?.mainWallet).toFixed(2)}</span>
                                            <button onClick={_refreshBalance}>
                                                <img src="/images/refreshBalanceIcon.svg" alt="" className={loading?.refreshLoading?"rotating-wheel":""} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="depositMethod">
                        <h4>
                            <img src="/images/Bank.svg" alt="" />
                            <span>Select Deposit Method</span>
                        </h4>
                          {
                            loading?.rulesLoading ?
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
                                <div className="dmlist">
                                
                                    {
                                        (depositRules?.activeDepositMethod?.payFromUpi) ?
                                            <button onClick={()=>_changePaymentType("payFromUPI")} className='depositPaymentMethod'>
                                                <div className="imageSection">
                                                    <img src="/images/bonusIcon.png" alt="" />
                                                    <span>{bonusData?.payFromUpi?.bonusAmount}%</span>
                                                </div>
                                                <div className={`dmItemInner ${paymentType ==="payFromUPI"?"active":"" }`}>
                                                    <p>Pay From</p>                            
                                                    <span>UPI</span>                            
                                                </div>
                                            </button>
                                        :null
                                    }
                                    {
                                        (depositRules?.activeDepositMethod?.manualUpi) ?
                                            <button onClick={()=>_changePaymentType("upi")} className='depositPaymentMethod'>
                                                <div className="imageSection">
                                                    <img src="/images/bonusIcon.png" alt="" />
                                                    <span>{bonusData?.manualUpi?.bonusAmount}%</span>
                                                </div>
                                                <div className={`dmItemInner ${paymentType ==="upi"?"active":"" }`}>
                                                    <img src="/images/upi.svg" alt="" />
                                                    <span>UPI</span>                            
                                                </div>
                                            </button>
                                        :null
                                    }
                                    {
                                        (depositRules?.activeDepositMethod?.usdt) ?
                                            <button onClick={()=>_changePaymentType("usdt")} className='depositPaymentMethod'>
                                                <div className="imageSection">
                                                    <img src="/images/bonusIcon.png" alt="" />
                                                    <span>{bonusData?.usdt?.bonusAmount}%</span>
                                                </div>
                                                <div className={`dmItemInner ${paymentType ==="usdt"?"active":"" }`}>
                                                    <img src="/images/usdtIcon.svg" alt="" />
                                                    <span>USDT TRC20</span>                            
                                                </div>
                                            </button>
                                        :null
                                    }
                                </div>

                            }
                         {/* {
                           (!loading?.rulesLoading && paymentType ==="upi") ?
                            <div className="mbButtons" style={
                                {
                                    position:"relative",
                                    flexDirection:"column",
                                    alignItems:"flex-start",
                                    gap:15,
                                    marginTop:30
                                }
                            }>
                                {
                                    loading?.upiListLoading ?
                                     <div className='loadingOverData'>
                                        <Spin size="large" tip="Loading" />
                                    </div>
                                    :null
                                }
                                <label style={{color:"#fff"}}>Select UPI Account</label>
                                <Select style={{width:"100%",color:"#fff"}} placeholder="Select UPI" className='custom-white-select'
                                    onChange={(value)=>setselectedUpi(value)} value={selectedUpi}>
                                    <Select.Option value="">Select UPI</Select.Option>
                                    {
                                        upiList?.map((item,index)=>{
                                            return(
                                                <Select.Option value={item?.upiId} key={item?._id || index}>
                                                    {item?.label} : {item?.upiId}
                                                </Select.Option>
                                            )
                                        })
                                    }
                                </Select>
                            </div>
                             :null
                         } */}
                         {/* {
                           (!loading?.rulesLoading && paymentType ==="usdt") ?
                            <div className="mbButtons" style={
                                {
                                    position:"relative",
                                    flexDirection:"column",
                                    alignItems:"flex-start",
                                    gap:15,
                                    marginTop:30
                                }
                            }>
                                {
                                    loading?.usdtListLoading ?
                                     <div className='loadingOverData'>
                                        <Spin size="large" tip="Loading" />
                                    </div>
                                    :null
                                }
                                 <label style={{color:"#fff"}}>Select USDT Account</label>
                                <Select style={{width:"100%",color:"#fff"}} placeholder="Select USDT" className='custom-white-select'
                                    onChange={(value)=>setselectedUsdt(value)} value={selectedUsdt}>
                                    <Select.Option value="">Select USDT</Select.Option>
                                    {
                                        usdtList?.map((item,index)=>{
                                            return(
                                                <Select.Option value={item?.usdtAddress} key={item?._id || index}>
                                                    {item?.label} : {item?.usdtAddress}
                                                </Select.Option>
                                            )
                                        })
                                    }
                                </Select>
                            </div>
                             :null
                         } */}
                    </div>
                    <div className="depositAmount">
                        <div className='daTopFlex'>
                            <h4>
                                <img src="/images/depositIIcon.svg" alt="" />
                                <span>Deposit Amount</span>
                            </h4>
                            {
                                paymentType==="usdt" &&
                                    <span className='dollarSymboltext'>
                                        1 USDT = ₹{usdtConversionRate}
                                    </span>
                            }

                        </div>
                        <div className="datButtons">
                            <button onClick={()=>_changeDepostAmount(minimumDepositAmount)}> <span className={`datButtonInner ${depositAmount===minimumDepositAmount ?"active":""}`} >{paymentType==="usdt"? "$ 1":"₹ "+minimumDepositAmount}</span></button>
                            <button onClick={()=>_changeDepostAmount(200)}> <span className={`datButtonInner ${depositAmount===200 ?"active":""}`} >{paymentType==="usdt"?"$ 2":"₹ 200"}</span></button>
                            <button onClick={()=>_changeDepostAmount(400)}> <span className={`datButtonInner ${depositAmount===400 ?"active":""}`} >{paymentType==="usdt"?"$ 4":"₹ 400"}</span></button>
                            <button onClick={()=>_changeDepostAmount(600)}> <span className={`datButtonInner ${depositAmount===600 ?"active":""}`} >{paymentType==="usdt"?"$ 6":"₹ 600"}</span></button>
                            <button onClick={()=>_changeDepostAmount(800)}> <span className={`datButtonInner ${depositAmount===800 ?"active":""}`} >{paymentType==="usdt"?"$ 8":"₹ 800"}</span></button>
                            <button onClick={()=>_changeDepostAmount(1000)}> <span className={`datButtonInner ${depositAmount===1000 ?"active":""}`} >{paymentType==="usdt"?"$ 10":"₹ 1K"}</span></button>
                            <button onClick={()=>_changeDepostAmount(2000)}> <span className={`datButtonInner ${depositAmount===2000 ?"active":""}`} >{paymentType==="usdt"?"$ 20":"₹ 2K"}</span></button>
                            <button onClick={()=>_changeDepostAmount(4000)}> <span className={`datButtonInner ${depositAmount===4000 ?"active":""}`} >{paymentType==="usdt"?"$ 40":"₹ 4K"}</span></button>
                            <button className="bonusButton" onClick={()=>_changeDepostAmount(5000)}>
                                <span  className={`datButtonInner ${depositAmount===5000 ?"active":""}`}>
                                    <span>{paymentType==="usdt"?"$ 50":"₹ 5K"}</span>
                                </span>
                            </button>
                            <button className="bonusButton" onClick={()=>_changeDepostAmount(10000)}>
                                <span  className={`datButtonInner ${depositAmount===10000 ?"active":""}`}>
                                    <span>{paymentType==="usdt"?"$ 100":"₹ 10K"}</span>
                                </span>
                            </button>
                            <button className="bonusButton" onClick={()=>_changeDepostAmount(20000)}>
                                <span  className={`datButtonInner ${depositAmount===20000 ?"active":""}`}>
                                    <span>{paymentType==="usdt"?"$ 200":"₹ 20K"}</span>
                                </span>
                            </button>
                            <button className="bonusButton" onClick={()=>_changeDepostAmount(50000)}>
                                <span  className={`datButtonInner ${depositAmount===50000 ?"active":""}`}>
                                    <span>{paymentType==="usdt"?"$ 500":"₹ 50K"}</span>
                                </span>
                            </button>
                        </div>
                        {
                            paymentType==="usdt"?
                                <div className="depositPrice">
                                    <img src="/images/usdtblueicon.svg" alt="" />
                                    <input type="number" placeholder='Enter USDT amount' value={usdtAmount} onChange={_changeUsdtAmount} />
                                    <button onClick={()=>{setUsdtAmount(0);setdepositAmount(0)}}>
                                        <img src="/images/crosswhite.svg" alt="" />
                                    </button>
                                </div>
                            :null
                        }
                        <div className="depositPrice">
                            <img src="/images/greenRupee.svg" alt="" />
                            <input type="number" placeholder='Enter amount' value={depositAmount} onChange={_depositInputChange} />
                            <button onClick={()=>{setdepositAmount(0);setUsdtAmount(0)}}>
                                <img src="/images/crosswhite.svg" alt="" />
                            </button>
                        </div>
                        <div className="dtpButton">
                            <button onClick={_DepositeAmountSubmit}>
                                Deposit
                            </button>
                        </div>
                    </div>
                    <div className="depositInstruction depositAmount">
                        <h4>
                            <img src="/images/depositIIcon.svg" alt="" />
                            <span>Deposit Instruction</span>
                        </h4>
                        <ul>
                            {
                                loading?.rulesLoading ?
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
                                paymentRulesToShow?.length>0?
                                    paymentRulesToShow?.map((item,index)=><li key={index}>{item}</li>)
                                : <p>No data found.</p>
                            }
                        </ul>
                    </div>
                    
                </div>
                <div className="dpiTableWrapper">
                    <div className="dpITable">
                        <div className="mwPreTableHeader">
                            <h4>Deposit History</h4>
                            {/* <div className="mbButtons">
                                <button onClick={()=>navigate("/deposit-history")}>
                                    <span>
                                        View All Transaction 
                                    </span>
                                    <img src="/images/Polygon 2.png" alt="" />
                                </button>
                            </div> */}
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
                                                <span>Deposit</span>
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
                                            loading?.tableLoading ?
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
                                                filteredDdepositHistory?.length > 0 ? (
                                                    filteredDdepositHistory.map((rowData, index) => (
                                                    <div className="tecRowOuter" key={rowData?._id || index}>
                                                        <div className="tecRow">
                                                        <div className="tecTd type">
                                                            {/* <span className="tag">{rowData.type}</span> */}
                                                            <span>{rowData?.paymentMode}</span>
                                                        </div>
                                                        <div className="tecTd orderId">
                                                            <span>{rowData?.transactionId || "N/A"}</span>
                                                        </div>
                                                        <div className="tecTd game dateTime">
                                                            <span>{rowData?.createdAt?.length ? moment(rowData.createdAt).format("DD-MM-YYYY HH:mm") : ""}</span>
                                                        </div>
                                                        <div className="tecTd price depositWithdrwal">
                                                            <span>{rowData.amount}</span>
                                                        </div>
                                                        <div className="tecTd balance">
                                                            <span>{rowData.remainingBalance}</span>
                                                        </div>
                                                        <div className={`tecTd status ${rowData.status}`}>
                                                            <span className="tecTdTag">{rowData.status}</span>
                                                            <button
                                                                onClick={()=>{
                                                                    setselectedDepoiteEntry(rowData)
                                                                    setdepositDetialsModalVisible(true);
                                                                }}
                                                            >
                                                                <img src="/images/eyeButtonIcon.svg" alt="view" />
                                                            </button>
                                                        </div>
                                                        </div>
                                                    </div>
                                                    ))
                                                ) : 
                                                <div className="tecRow" style={{justifyContent:"center",background:"#26364b",height:100}}>
                                                        <div className="tecTd attendanceTitle game"style={{justifyContent:"center"}} >
                                                            No Data Found
                                                        </div>
                                                </div>
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
            </div>


        {
            depositSuccessVisible &&
                <DepositSucesssModal open={depositSuccessVisible} setOpen={setDepositSuccessVisible} depositeData={depositAlertData}/>
        }
        {
            depositeFailedVisible &&
                <DepositeFailedModal open={depositeFailedVisible} setOpen={setDepositeFailedVisible} depositeData={depositAlertData}/>
        }
        {
            depositDetialsModalVisible &&
                <VeiwDetailsModal 
                    open={depositDetialsModalVisible} 
                    closeModal={()=>{setdepositDetialsModalVisible(false);setselectedDepoiteEntry(null)}} 
                    record={selectedDepoiteEntry} 
                />
        }
        </div>
    )
}
