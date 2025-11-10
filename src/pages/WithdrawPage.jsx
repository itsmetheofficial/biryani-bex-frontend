import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DepositSucesssModal from '../components/DepositSucesssModal';
import DepositeFailedModal from '../components/DepositeFailedModal';
import VeiwDetailsModal from '../components/VeiwDetailsModal';
import { callGetAPI, callPostAPI, fetchUserBalanceHelper, fetchUserDetailsHelper } from '../api/apiHelper';
import { API_ENDPOINTS } from '../api/apiConfig';
import { useCookies } from 'react-cookie';
import { Button, message, Modal, Spin } from 'antd';
import moment from 'moment';  
import create from '@ant-design/icons/lib/components/IconFont';
import { PlusOutlined } from '@ant-design/icons';

export default function WithdrawPage() {
    const navigate = useNavigate()
    const [cookies,setCookies] = useCookies();
    const [paymentType,setpaymentType] = useState("Bank");
    const [withdrawAmout,setwithdrawAmout] = useState(100);
    const [userPassword,setUserPassword] = useState("");
    const [usdtAmount,setUsdtAmount] = useState(1);
    const [withdrawSuccessVisible,setWithdrawSuccessVisible] = useState(false);
    const [withdrawAlertData,setwithdrawAlertData] = useState({});
    const [withdrawFailedVisible,setwithdrawFailedVisible] = useState(false);
    const [withdrawDetialsModalVisible, setwithdrawDetialsModalVisible] = useState(false);
    const [selectedwithdrawEntry, setselectewithdrawEntry] = useState(null);
    const [filteredTransectionlist,setfilteredTransectionlist] = useState([])
    const [withdrawalRules,setwithdrawalRules] = useState({});
    const [paymentRulesToShow,setpaymentRulesToShow] = useState([]);
    const [transationsData,setTransationsData] = useState([]);
    const [showSelectBankModalBank,setShowSelectBankModalBank] = useState(false);
    const [showSelectBankModalUsdt,setShowSelectBankModalUsdt] = useState(false);
    const [selectedBank,setSelectedBank] = useState(null);
    const [selectedUsdt,setSelectedUsdt] = useState(null);
    const [bankList,setBankList] = useState([]);
    const [usdtList,setUsdtList] = useState([]);
    const [loading,setLoading] = useState({
        withdrawal:false,
        tableLoading:false,
        refreshLoading:false,
        selectModalLoading:false,
        paymentlistLoading:false,
        createWithdrawLoading:false
        
    })

    useEffect(()=>{
        if(bankList?.length>0){
            let defaultBank = bankList?.find((b)=>b?.isSelected===true)
            setSelectedBank(defaultBank);
        }
    },[bankList])
    useEffect(()=>{
        if(usdtList?.length>0){
            let defaultUsdt = usdtList?.find((b)=>b?.isSelected===true)
            setSelectedUsdt(defaultUsdt);
        }
    },[usdtList])

    useEffect(()=>{
        if(paymentType && transationsData?.length>0){
            let filteredData = transationsData?.filter((t)=>t?.paymentMode===paymentType)
            setfilteredTransectionlist(filteredData)
        }else{
            setfilteredTransectionlist([])
        }
    },[paymentType,transationsData])

    useEffect(()=>{
        if(cookies?.token){
            fetchWithdrawalRules(cookies?.token);
            fetchTransactions(cookies?.token);
            fetchPaymentDetails("Bank",cookies?.token);
            fetchPaymentDetails("usdt",cookies?.token);
            _refreshBalance();
        }
    },[cookies?.token])

    useEffect(()=>{
        if(paymentType?.length>0 && withdrawalRules){
            if(paymentType==="Bank"){
                setpaymentRulesToShow(withdrawalRules?.bank)
            } else if(paymentType==="upi"){
                setpaymentRulesToShow(withdrawalRules?.payFromUpiWithdrawRules)
            }
            if(paymentType==="usdt"){
                setpaymentRulesToShow(withdrawalRules?.usdtWithdrawRules)
            }
        }
    },[paymentType,withdrawalRules])

    const fetchPaymentDetails = async(type,token)=>{
        setLoading((prev)=>({...prev,paymentlistLoading:true}))
        try{
            let res = await callGetAPI(API_ENDPOINTS?.GET_PAYMENT_DETAILS,token,{userId:cookies?.userDetails?.userId,type});
            if(res?.success){
                if(type==="Bank"){
                    setBankList(res?.data)
                } else if(type==="usdt"){
                    setUsdtList(res?.data)
                }
            }
        }catch{
            setBankList([])
            setUsdtList([])
        }finally{
            setLoading((prev)=>({...prev,paymentlistLoading:false}))
        }
    }

    const fetchWithdrawalRules = async(token) =>{
        setLoading((prev)=>({...prev,withdrawal:true}))
        try{
            const res = await callGetAPI(API_ENDPOINTS?.GET_WITHDRAWAL_RULES,token);
            if(res?.success){
                setwithdrawalRules(res?.data)
            }else{
                setwithdrawalRules({})
            }
        }catch{
            setwithdrawalRules({})
        }finally{
            setLoading((prev)=>({...prev,withdrawal:false}))
        }
    }

    const fetchTransactions = async (token) => {
        try {
        setLoading((prev)=>({...prev,tableLoading:true}))

        // const response = await callGetAPI(API_ENDPOINTS.GET_ALL_TRANSACTIONS, token,{page:1,limit:1000,transactionType:"Withdraw"});
        const response = await callGetAPI(API_ENDPOINTS.GET_ALL_TRANSACTIONS, token,{page:1,limit:1000,transactionType:"Withdraw",userId:cookies?.userDetails?.userId});

        if (response?.success) {
            setTransationsData(response?.transactions || []);
        } else {
            setTransationsData([]);
            message.error(response?.message || "Failed to fetch transactions");
        }
        } catch (error) {
            message.error("Failed to fetch transactions");
        } finally {
            setLoading((prev)=>({...prev,tableLoading:false}))
        }
    };

    const _changePaymentType =(type)=>{
        setpaymentType(type)
    }
    const _depositInputChange =(e)=>{
        if(e.target.value?.length>0 || !isNaN(e.target.value)){
            if(!isNaN(e.target.value)){
                setwithdrawAmout(parseInt(e.target.value))
                setUsdtAmount(parseInt(e.target.value)/100)
            }
        }
    }
    const _changeUsdtAmount =(e)=>{
        if(e.target.value?.length>0 || !isNaN(e.target.value)){
            if(!isNaN(e.target.value)){
                setUsdtAmount(parseInt(e.target.value))
                setwithdrawAmout(parseInt(e.target.value)*100)
            }
        }
    }
    
    const _withdrawBalance =()=>{
        if(paymentType==="Bank"){
            if(withdrawAmout<withdrawalRules?.bankWithdrawSettings?.minimumWithdrawAmount){
                message.error("Minimum withdraw amount is "+withdrawalRules?.bankWithdrawSettings?.minimumWithdrawAmount)
                return;
            }else if(withdrawAmout>withdrawalRules?.bankWithdrawSettings?.maximumWithdrawAmount){
                message.error("Maximum withdraw amount is "+withdrawalRules?.bankWithdrawSettings?.maximumWithdrawAmount)
                return;
            }
        }else if(paymentType === "usdt"){
            if(withdrawAmout<withdrawalRules?.usdtWithdrawSettings?.minimumWithdrawAmount){
                message.error("Minimum withdraw amount is "+withdrawalRules?.usdtWithdrawSettings?.minimumWithdrawAmount)
                return;
            }else if(withdrawAmout>withdrawalRules?.usdtWithdrawSettings?.maximumWithdrawAmount){
                message.error("Maximum withdraw amount is "+withdrawalRules?.usdtWithdrawSettings?.maximumWithdrawAmount)
                return;
            }
        }
        createWithdrawRequest()
    }

    const createWithdrawRequest = async()=>{
        if(!userPassword?.length>0){
            message.error("Password is required");
            return;
        }
        setLoading((prev)=>({...prev,createWithdrawLoading:true}));
        try{
            let payload = {
                userId:cookies?.userDetails?.userId,
                amount:withdrawAmout,
                method:paymentType,
                password:userPassword
            }
            if(paymentType==="usdt"){
                payload.usdt = selectedUsdt?.usdtAddress;
            }
            let res = await callPostAPI(API_ENDPOINTS.CREATE_WITHDRAWREQUEST,payload,cookies?.token);
            if(res?.success){
                let alertData = {
                    message:res?.message||"Withdraw Successful",
                    amount:withdrawAmout,
                    page:"Withdraw"
                }
                setwithdrawAlertData(alertData);
                setWithdrawSuccessVisible(true)

                
            }else{
                message.error(res?.message);
            }
            fetchTransactions(cookies?.token);
            _refreshBalance();
            setwithdrawAmout(100);
            setUserPassword("");
            setUsdtAmount(1);
            setTimeout(() => {
                setwithdrawAlertData({});
                setWithdrawSuccessVisible(false)
            }, 2000);

             
        }catch{
            message.error("Failed to create withdraw request");
        }finally{
            setLoading((prev)=>({...prev,createWithdrawLoading:false}));
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

    const _selectPaymentMethod = async(item,type)=>{
        setLoading((prev)=>({...prev,selectModalLoading:true}));
        try{
            let payload ={
                userId:cookies?.userDetails?.userId,
                detailId:item?._id,
                checked:true,
                type
            }
            let res = await callPostAPI(API_ENDPOINTS.SELECT_BANK_DETAILS, payload,cookies?.token);
            if (res?.success){
                message.success(res?.message);
            }else{
                message.error(res?.message);
            }
        }catch{
            message.error("Failed to select "+type);
        }finally{
            fetchPaymentDetails(type,cookies?.token);
            setLoading((prev)=>({...prev,selectModalLoading:false}));
            setShowSelectBankModalBank(false);
            setShowSelectBankModalUsdt(false)
        }
    }

    return (
        <div className="depositPage withdrwalPage">
            <div className='aboutUsPage' >
                {
                    loading.createWithdrawLoading ?
                        <div className='loadingOverData' style={{position:"fixed"}}>
                            <Spin size="large" tip="Loading" />
                        </div>
                        :null
                }
                <div className="auHeaderOuter">
                    <div className="auHeader">
                        <span>Withdraw</span>
                        <button onClick={() => navigate(-1)}>
                            <img src="/images/closeModalIcon.png" alt="" />
                        </button>
                    </div>
                </div>
                <div className="dpWrapper" >
                    
                    <div className="dpTop">
                        <div className="mwtLeft">
                            <div className="mwlTopOuter">
                                <div className="mwlTop">
                                    <div className="mwtText">
                                        <img src="/images/newWalletIcon.svg" alt="" />
                                        <span>Available Balance</span>
                                    </div>
                                    <div className="mwtBalanceOuter">
                                        <div className="mwtBalance">
                                            <span>₹ {isNaN(cookies?.userDetails?.mainWallet) ? 0 : parseFloat(cookies?.userDetails?.mainWallet).toFixed(2)}</span>
                                             <button onClick={_refreshBalance}>
                                                <img src="/images/refreshBalanceIcon.svg" alt="" className={loading?.refreshLoading?"rotating-wheel":""} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className='withdrawableAmountPara'>Withdrawable Amount : ₹ {isNaN(cookies?.userDetails?.withdrawableAmount) ? 0 : parseFloat(cookies?.userDetails?.withdrawableAmount).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="depositMethod">
                        <h4>
                            <img src="/images/Bank.svg" alt="" />
                            <span>Select Withdraw Method</span>
                        </h4>
                        <div className="dmlist">
                            <button onClick={()=>_changePaymentType("Bank")}>
                                <div className={`dmItemInner ${paymentType ==="Bank"?"active":"" }`}>
                                    <img src="/images/Bank.svg" alt="" />
                                    <span>BANK</span>                            
                                </div>
                            </button>
                            {/* <button onClick={()=>_changePaymentType("upi")}>
                                <div className={`dmItemInner ${paymentType ==="upi"?"active":"" }`}>
                                    <img src="/images/upi.svg" alt="" />
                                    <span>UPI</span>                            
                                </div>
                            </button> */}
                            <button onClick={()=>_changePaymentType("usdt")}>
                                <div className={`dmItemInner ${paymentType ==="usdt"?"active":"" }`}>
                                    <img src="/images/usdtIcon.svg" alt="" />
                                    <span>USDT TRC20</span>                            
                                </div>
                            </button>
                            <button style={{visibility:"hidden"}}></button>
                        </div>
                    </div>
                    {
                        paymentType==="Bank" &&
                            <div className="withdrawalBankDetails">
                                <div className="wbdLeft">
                                    <div className="wbdLeftInner" onClick={()=> setShowSelectBankModalBank(true)}
                                        style={{position:"relative"}}>
                                        {
                                            loading?.paymentlistLoading ?
                                                <div className='loadingOverData'>
                                                    <Spin size="large" tip="Loading" />
                                                </div>
                                            :null
                                        }
                                        {
                                            selectedBank?._id ?
                                            <>
                                                <div className="wdlLeft">
                                                    {/* <img src="/images/hdfcWhite.svg" alt="" /> */}
                                                    <span>{selectedBank?.bank}</span>
                                                </div>
                                        
                                                <div className="wdlRight">
                                                    <span>{selectedBank?.accountNumber}</span>
                                                    <img src="/images/arrowfilledRight.svg" alt="" />
                                                </div>
                                            </> 
                                            : 
                                            <>
                                            <div className="wdlLeft">
                                                    {/* <img src="/images/hdfcWhite.svg" alt="" /> */}
                                                <span></span>
                                            </div>
                                    
                                            <div className="wdlRight">
                                                <span>Select Bank</span>
                                                <img src="/images/arrowfilledRight.svg" alt="" />
                                            </div>
                                            </>
                                        }
                                    </div>
                                </div>
                                <div className="wdbRight">
                                    <div className="gradientButton">
                                        <button  onClick={()=>navigate("/add-bank-account")}>
                                            {/* <img src="/images/refreshfilled.svg" alt="" /> */}
                                            <PlusOutlined style={{fontSize:25}} />
                                            <span>Add  <br />Account</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                    }
                    {
                        
                        paymentType==="usdt" &&
                            <div className="withdrawalBankDetails">
                                <div className="wbdLeft">
                                    <div className="wbdLeftInner" onClick={()=> setShowSelectBankModalUsdt(true)}
                                        style={{position:"relative"}}>
                                        {
                                            loading?.paymentlistLoading ?
                                                <div className='loadingOverData'>
                                                    <Spin size="large" tip="Loading" />
                                                </div>
                                            :null
                                        }
                                        {
                                            selectedUsdt?._id  ?
                                            <>
                                                <div className="wdlLeft">
                                                    {/* <img src="/images/hdfcWhite.svg" alt="" /> */}
                                                    <span>{selectedUsdt?.addressAlias}</span>
                                                </div>
                                        
                                                <div className="wdlRight">
                                                    <span>{selectedUsdt?.usdtAddress}</span>
                                                    <img src="/images/arrowfilledRight.svg" alt="" />
                                                </div>
                                            </> 
                                            : 
                                            <>
                                            <div className="wdlLeft">
                                                    {/* <img src="/images/hdfcWhite.svg" alt="" /> */}
                                                <span></span>
                                            </div>
                                    
                                            <div className="wdlRight">
                                                <span>Select Usdt</span>
                                                <img src="/images/arrowfilledRight.svg" alt="" />
                                            </div>
                                            </>
                                        }
                                    </div>
                                </div>
                                <div className="wdbRight">
                                    <div className="gradientButton">
                                        <button onClick={()=>navigate("/add-usdt-account")}>
                                            {/* <img src="/images/refreshfilled.svg" alt="" /> */}
                                            <PlusOutlined />
                                            <span>Add USDT <br />Account</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                    }
                    {
                        paymentType==="upi" &&
                              <div className="withdrawalBankDetails">
                                <div className="wbdLeft">
                                    <div className="wbdLeftInner">
                                        <div className="wdlLeft">
                                            <img src="/images/UPIImages.png" alt="" />
                                            <span>UPI</span>
                                        </div>
                                
                                        <div className="wdlRight">
                                            <span>77777777@lke.com</span>
                                            <img src="/images/arrowfilledRight.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="wdbRight">
                                    <div className="gradientButton">
                                        <button>
                                            <img src="/images/refreshfilled.svg" alt="" />
                                            <span>Change <br />Account</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                    }
                    {/* {
                        paymentType==="usdt" &&
                              <div className="withdrawalBankDetails">
                                <div className="wbdLeft" style={{width:"100%"}}>
                                    <div className="wbdLeftInner">
                                        <div className="depositPrice usdtAdress">
                                            <input 
                                                type="text" 
                                                placeholder='Enter Usdt address'
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                    } */}
                    <div className="depositAmount">
                            <h4>
                                <img src="/images/depositIIcon.svg" alt="" />
                                <span>Withdraw Amount</span>
                            </h4> 
                             {
                                paymentType==="usdt" &&
                                    <span className='dollarSymboltext' >
                                        1 USDT = ₹100
                                    </span>
                            }  
                            
                        
                        {
                            paymentType==="usdt"?
                                <div className="depositPrice">
                                    <img src="/images/usdtblueicon.svg" alt="" />
                                    <input type="number" placeholder='Enter USDT amount' value={usdtAmount} onChange={_changeUsdtAmount} />
                                    <button onClick={()=>setUsdtAmount(0)}>
                                        <img src="/images/crosswhite.svg" alt="" />
                                    </button>
                                </div>
                            :null
                        }
                        <div className="depositPrice">
                            <img src="/images/greenRupee.svg" alt="" />
                            <input type="number" placeholder='Enter amount' value={withdrawAmout} onChange={_depositInputChange} />
                            <button onClick={()=>setwithdrawAmout(0)}>
                                <img src="/images/crosswhite.svg" alt="" />
                            </button>
                        </div>
                        <div className="depositPrice depositPassword">
                            <img src="/images/lockIcon.svg" alt="" />
                            <input type="password" placeholder='Enter Password' value={userPassword} onChange={(e)=>e.target.value?.includes(" ") ? null : setUserPassword(e.target.value)} />
                            <button onClick={()=>setUserPassword("")}>
                                <img src="/images/crosswhite.svg" alt="" />
                            </button>
                        </div>
                        <div className="dtpButton">
                            <button onClick={_withdrawBalance}>
                                Withdraw
                            </button>
                        </div>
                    </div>
                    <div className="depositInstruction depositAmount">
                        <h4>
                            <img src="/images/depositIIcon.svg" alt="" />
                            <span>Withdraw Instruction</span>
                        </h4>
                        <ul>
                             {
                                loading?.withdrawal ?
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
                                paymentRulesToShow?.length>0 ?

                                    paymentRulesToShow?.map((item,index)=>{

                                        if(paymentType==="Bank"){
                                            item = item?.replace("{{WITHDRAW_TIMES}}",withdrawalRules?.bankWithdrawSettings?.count)
                                                   .replace("{{MINIMUM_WITHDRAW_AMOUNT}}",withdrawalRules?.bankWithdrawSettings?.minimumWithdrawAmount)
                                                   .replace("{{MAXIMUM_WITHDRAW_AMOUNT}}",withdrawalRules?.bankWithdrawSettings?.maximumWithdrawAmount)
                                        }else if(paymentType==="usdt"){
                                            item = item?.replace("{{WITHDRAW_TIMES}}",withdrawalRules?.usdtWithdrawSettings?.count)
                                                   .replace("{{MINIMUM_WITHDRAW_AMOUNT}}",withdrawalRules?.usdtWithdrawSettings?.minimumWithdrawAmount)
                                                   .replace("{{MAXIMUM_WITHDRAW_AMOUNT}}",withdrawalRules?.usdtWithdrawSettings?.maximumWithdrawAmount)
                                        }

                                        return (
                                            <li key={index}>{item}
                                                </li>

                                        )   
                                    }
                                    )
                                : <p>No data found.</p>
                            }
                            
                        </ul>
                    </div>
                    
                </div>
                <div className="dpiTableWrapper">
                    <div className="dpITable">
                        <div className="mwPreTableHeader">
                            <h4>Withdraw History</h4>
                            {/* <div className="mbButtons">
                                <button onClick={()=>navigate("/withdraw-history")}>
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
                                                <span>Withdraw</span>
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
                                                filteredTransectionlist?.length > 0 ?
                                                    filteredTransectionlist.map((rowData) => (
                                                        <div className="tecRowOuter">
                                                            <div className="tecRow">
                                                                <div className="tecTd type">
                                                                    <span className="tag">{rowData?.transactionType}</span>
                                                                    <span>{rowData?.paymentMode}</span>
                                                                </div>
                                                                <div className="tecTd orderId">
                                                                    <span>{rowData?.transactionId?.length>0 ? rowData?.transactionId : "N/A"}</span>
                                                                </div>
                                                                <div className="tecTd game dateTime">
                                                                    <span>{rowData?.createdAt?.length ? moment(rowData?.createdAt).format("DD-MM-YYYY HH:MM") : "N/A"}</span>
                                                                </div>
                                                                <div className="tecTd price depositWithdrwal negativeBalance">
                                                                    <span>- ₹{rowData?.amount>0 ? parseFloat(rowData?.amount)?.toFixed(2): 0}</span>
                                                                </div>
                                                                <div className="tecTd balance">
                                                                    <span>₹{rowData?.remainingBalance ? parseFloat(rowData?.remainingBalance)?.toFixed(2) : 0}</span>
                                                                </div>
                                                                <div className={`tecTd status ${rowData?.status}`}>
                                                                    <span className="tecTdTag">{rowData?.status}</span>
                                                                    <button onClick={()=>{
                                                                        setselectewithdrawEntry(rowData);
                                                                        setwithdrawDetialsModalVisible(true);
                                                                    }}>
                                                                        <img src="/images/eyeButtonIcon.svg" alt="" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                    :   <div className="tecRow" style={{justifyContent:"center",background:"#26364b",height:100}}>
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
                withdrawSuccessVisible &&
                    <DepositSucesssModal open={withdrawSuccessVisible} setOpen={setWithdrawSuccessVisible} depositeData={withdrawAlertData}/>
            }
            {
                withdrawFailedVisible &&
                    <DepositeFailedModal open={withdrawFailedVisible} setOpen={setwithdrawFailedVisible} depositeData={withdrawAlertData}/>
            }
            {
                withdrawDetialsModalVisible &&
                    <VeiwDetailsModal 
                        open={withdrawDetialsModalVisible} 
                        closeModal={()=>{setwithdrawDetialsModalVisible(false);setselectewithdrawEntry(null)}} 
                        record={selectedwithdrawEntry} 
                    />
            }
            {
                showSelectBankModalBank ?
                <Modal
                    open={showSelectBankModalBank}
                    closeIcon={null} 
                    onCancel={()=>setShowSelectBankModalBank(false)}
                    footer={null} 
                    className="history-depositModal customModal myAccountModal depositDetailsModal selectPaymentModal"
                    width={600}
                >
                    {
                        loading?.selectModalLoading ?
                         <div className='loadingOverData'>
                                <Spin size="large" tip="Loading" />
                            </div>
                        :null
                    }
                    <div className="cmHeader">
                        <span>Select Bank</span>
                        <button onClick={()=>setShowSelectBankModalBank(false)}>
                            <img src="/images/closeIcon.svg" alt="" />
                        </button>
                    </div>
                    <div className="cmBody">
                        <div className="bank-list">
                            {
                                 loading?.paymentlistLoading ?
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
                            bankList?.length>0 ?
                                bankList?.map((bank, index) => (
                                    <div
                                        key={index}
                                        className="bank-item"
                                        onClick={() => _selectPaymentMethod(bank,"Bank")}
                                    >
                                        {/* <div className="blIcon">
                                            <img src="/images/hdfcWhite.svg" alt="" />
                                        </div> */}
                                        <div className="bank-details">
                                        <div className="bank-name">{bank?.bank}</div>
                                        <div className="bank-account">{bank?.accountNumber}</div>
                                        </div>
                                    </div>
                                ))
                                :
                                <div style={
                                    { 
                                        padding: 20,
                                        color:"#fff",
                                        height:100,
                                        display:"flex",
                                        alignItems:"center",
                                        justifyContent:"center",
                                        flexDirection:"column"
                                    }
                                }>
                                   <span> No data found!</span>
                                   <br />
                                    <Button style={{padding:"5px 10px 7px",display:"inline-block",}} onClick={()=>navigate("/add-bank-account")}>
                                        Add Bank Account
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                </Modal>
                :null
            }
            {
                showSelectBankModalUsdt ?
                <Modal
                    open={showSelectBankModalUsdt}
                    closeIcon={null} 
                    onCancel={()=>setShowSelectBankModalUsdt(false)}
                    footer={null} 
                    className="history-depositModal customModal myAccountModal depositDetailsModal"
                    width={600}
                >
                     {
                        loading?.selectModalLoading ?
                         <div className='loadingOverData'>
                                <Spin size="large" tip="Loading" />
                            </div>
                        :null
                    }
                    <div className="cmHeader">
                        <span>Select USDT</span>
                        <button onClick={()=>setShowSelectBankModalUsdt(false)}>
                            <img src="/images/closeIcon.svg" alt="" />
                        </button>
                    </div>
                    <div className="cmBody">
                        <div className="bank-list">
                            {
                                loading?.paymentlistLoading ?
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
                                usdtList?.length>0 ?
                            
                                    usdtList?.map((usdt, index) => (
                                    <div
                                        key={index}
                                        className="bank-item"
                                        onClick={() => _selectPaymentMethod(usdt,"usdt")}
                                    >
                                        {/* <div className="blIcon">
                                            <img src="/images/hdfcWhite.svg" alt="" />
                                        </div> */}
                                        <div className="bank-details">
                                            <div className="bank-name">{usdt?.addressAlias}</div>
                                            <div className="bank-account">{usdt?.usdtAddress}</div>
                                        </div>
                                    </div>
                                    ))
                                :
                                 <div style={
                                    { 
                                        padding: 20,
                                        color:"#fff",
                                        height:100,
                                        display:"flex",
                                        alignItems:"center",
                                        justifyContent:"center",
                                        flexDirection:"column"
                                    }
                                }>
                                   <span> No data found!</span>
                                   <br />
                                    <Button style={{padding:"5px 10px 7px",display:"inline-block",}} onClick={()=>navigate("/add-usdt-account")}>
                                        Add Usdt Account
                                    </Button>
                                </div>
                            }
                            {
                                usdtList?.map((usdt, index) => (
                                    <div
                                        key={index}
                                        className="bank-item"
                                        onClick={() => _selectPaymentMethod(usdt,"usdt")}
                                    >
                                        {/* <div className="blIcon">
                                            <img src="/images/hdfcWhite.svg" alt="" />
                                        </div> */}
                                        <div className="bank-details">
                                            <div className="bank-name">{usdt?.addressAlias}</div>
                                            <div className="bank-account">{usdt?.usdtAddress}</div>
                                        </div>
                                    </div>
                                    ))
                            }
                            {
                                usdtList?.map((usdt, index) => (
                                    <div
                                        key={index}
                                        className="bank-item"
                                        onClick={() => _selectPaymentMethod(usdt,"usdt")}
                                    >
                                        {/* <div className="blIcon">
                                            <img src="/images/hdfcWhite.svg" alt="" />
                                        </div> */}
                                        <div className="bank-details">
                                            <div className="bank-name">{usdt?.addressAlias}</div>
                                            <div className="bank-account">{usdt?.usdtAddress}</div>
                                        </div>
                                    </div>
                                    ))
                            }
                        </div>
                    </div>
                </Modal>
                :null
            }

        </div>
    )
}
