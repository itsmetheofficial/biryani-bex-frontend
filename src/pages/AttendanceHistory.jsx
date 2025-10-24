import { useCookies } from "react-cookie";
import { callGetAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";

export default function AttendanceHistory() {

    const navigate = useNavigate();
    const [cookies,setCookies] = useCookies();
    const [loading,setLoading] = useState(false);
    const [attendanceHistory,setAttendanceHistory] = useState([]);

    useEffect(()=>{
        fetchAttendanceHistory();
    },[])
    
    const fetchAttendanceHistory = async()=>{
        try{
            setLoading(true);
            let token = cookies?.token;
            let userId = cookies?.userDetails?.userId;
            if(token && userId){
                let res = await callGetAPI(API_ENDPOINTS.DAILY_ATTENDANCE_HISTORY(userId), token);
                if(res?.success){
                    setAttendanceHistory(res?.history || [])
                }else{
                    message.error(res?.message || "Failed to fetch attendance history");
                    setAttendanceHistory([])
                }
            }

        }catch(error){
            message.error("Failed to fetch attendance history");
            setAttendanceHistory([])
        }
        setLoading(false);

    }
  return (
    <div className="giftsPage">
        <div className="pageHeader">
            <button onClick={()=>navigate(-1)} className="headerPrevButton">
                <img src="/images/leftArrowFilled.svg" alt=""/>
            </button>
            <img src="/images/Daily-Attendance.png" alt="" width={50} />
            <span>Daily Attendance</span>
        </div>
        <div className="gsTable">
            <div className="tecTable">
                <div className="tecBody">
                    {
                        loading ?
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
                        attendanceHistory?.length>0 ?
                            attendanceHistory?.map((rowData) => (
                                <div className="tecRowOuter">
                                    <div className="tecRow">
                                        <div className="tecTd attendanceTitle game">
                                            Continuous Attendance Day {rowData?.dayNumber || "--"}
                                        </div>
                                        <div className="tecTd game attendanceDate">
                                            <span>{rowData?.claimDate?.length>0 ? moment(rowData?.claimDate).format("DD-MM-YYYY || HH:mm") : "--"}</span>
                                        </div>
                                        <div className="tecTd price totalBets">
                                            <span>₹{rowData?.bonusAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        :
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
  )
}
