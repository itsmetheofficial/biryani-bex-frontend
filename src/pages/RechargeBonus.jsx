import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { API_ENDPOINTS } from '../api/apiConfig';
import { callGetAPI } from '../api/apiHelper';
import { useNavigate } from 'react-router-dom';

export default function RechargeBonus() {
    const navigate = useNavigate();
    const [cookies,setCookies] = useCookies();
    const [rechargeBonusData,setRechargeBonusData] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect(()=>{
        fetchRechargeBonus()
    },[])

    const fetchRechargeBonus = async()=>{
        setLoading(true)
        let token = cookies?.token;
        let res = await callGetAPI(API_ENDPOINTS.GET_FIRST_RECHARGE_BONUS, token);
        if(res?.success){

            setRechargeBonusData(res?.firstRechargeBonus || []);
        }else{
            setRechargeBonusData([]);
        }
        setLoading(false)
    }
  return (
    <div className="rechargeBonusPage">
        <div className="pageHeader">
            <button onClick={()=>navigate(-1)} className="headerPrevButton">
                <img src="/images/leftArrowFilled.svg" alt=""/>
            </button>
            <img src="/images/OffersPageIcon.svg" alt="" width={40} />
            <span>Recharge Bonus</span>
        </div>
        <div className="rbTop">
            <div className="rbtLeft">
                <img src="/images/rechargeBonusLeftGirft.png" alt="" />
            </div>
            <div className="rbtMid">
                <h4>YOUR FIRST</h4>
                <h5>RECHARGE AWARD</h5>
            </div>
            <div className="rbtRight">
                <img src="/images/RechargeBonusRightGift.png" alt="" />
            </div>
        </div>

        <div className="rowTableContainer">
            <div className="rtcLeft">
                <img src="/images/TableGiftLeft.png" alt="" />
            </div>
            <div className="rtcMid">
                <div className="rowTable">
                    <div className="rtHeader">
                        <div className="rtTh topupValue">
                            <img src="/images/topupValueIcon.svg" alt="" width={30} />
                            Top-up Value
                        </div>
                        <div className="rtTh reward">
                            <img src="/images/trophyIcon.svg" alt="" width={19} />
                            Reward
                        </div>
                    </div>
                    <div className="rtBody">
                        {
                            loading ?
                                <div className="rtTr">
                                    <div className="rtTd topupValue" style={{width:"100%",padding:20}}>
                                       Loading...
                                    </div>
                                </div>
                            :
                            rechargeBonusData?.length>0 ?
                                rechargeBonusData?.map((rowData,index)=>(
                                    <div className="rtTr" key={rowData?._id | index}>
                                        <div className="rtTd topupValue">
                                            ₹{rowData?.amount}
                                        </div>
                                        <div className="rtTd reward">
                                            ₹{rowData?.bonus}
                                        </div>
                                    </div>
                                ))
                            :
                             <div className="rtTr">
                                <div className="rtTd topupValue" style={{width:"100%",padding:20}}>
                                    No data found!
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="rtcRight">
                <img src="/images/TableGiftRight.png" alt="" />
            </div>
        </div>
    </div>
  )
}
