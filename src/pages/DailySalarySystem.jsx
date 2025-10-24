import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { callGetAPI } from '../api/apiHelper';
import { API_ENDPOINTS } from '../api/apiConfig';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function DailySalarySystem() {
    const navigate = useNavigate();
    const [cookies,setCookies] = useCookies();
    const [salarySystemData,setSalarySystemData] = useState([]);
    const [salarySystemRules,setSalarySystemRules] = useState([]);
    const [loading,setLoading] = useState(false);
    const token = cookies?.token;

    useEffect(()=>{
        fetchSalarySystemData();
    },[])

    const fetchSalarySystemData = async()=>{
        try{
            setLoading(true);
            let res = await callGetAPI(API_ENDPOINTS.GET_DAILY_SALARY_SYSTEM, token);
            if(res?.success){
                setSalarySystemData(res?.dailySalarySystem || []);
                setSalarySystemRules(res?.dailySalarySystemRules || [])
            }else{
                message.error(res?.message || "Failed to fetch data");
                setSalarySystemData([])
                setSalarySystemRules([])
            }
        }catch{
            message.error("Failed to fetch data");
            setSalarySystemData([])
            setSalarySystemRules([])

        }finally{
            setLoading(false);
        }
    }
    return (
        <div className="betCommissionPage">
            <div className="pageHeader">
                <button onClick={()=>navigate(-1)} className="headerPrevButton">
                    <img src="/images/leftArrowFilled.svg" alt=""/>
                </button>
                <img src="/images/OffersPageIcon.svg" alt="" width={40} />
                <span>Daily Salary System</span>
            </div>
            <div className="bcpTable">
                <div className="rowTable">
                    <div className="rtHeader">
                        <div className="rtTh reward">
                            <img src="/images/userfilledIcon.svg" alt="" width={19} />
                            Active Players
                        </div>
                        <div className="rtTh topupValue">
                            <img src="/images/topupValueIcon.svg" alt="" width={30} />
                            Daily Salary
                        </div>
                    </div>
                    <div className="rtBody">
                        {
                            loading ?
                                <div className="rtTr">
                                    <div
                                        className="rtTd topupValue"
                                        style={{ width: "100%", padding: 20 ,height:100}}
                                    >
                                        <Spin />
                                    </div>
                                </div>
                            :

                            salarySystemData?.length > 0 ?

                                salarySystemData?.map((rowData, index) => (
                                    <div className="rtTr" key={rowData?._id || index}>
                                        <div className="rtTd topupValue">
                                            {rowData?.activePlayers || 0}
                                        </div>
                                        <div className="rtTd reward">
                                            ₹{rowData?.amount || 0}
                                        </div>
                                    </div>
                                ))
                            :
                                <div className="rtTr">
                                    <div
                                        className="rtTd topupValue"
                                        style={{ width: "100%", padding: 20,height:100}}
                                    >
                                        No Data Found!
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
            <div className="bcpRules">
                <h4>Bet Commission Rules</h4>
                <ul>
                    {   loading ? (
                            <div
                                style={{
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                }}
                            >
                                <Spin />
                            </div>
                        ) :
                        salarySystemRules?.length ?
                            salarySystemRules.map((rule,index)=>(
                                <li key={index}>
                                    {rule}
                                </li>
                            ))
                        :
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
                    }
                </ul>
            </div>
        </div>
    )
}
