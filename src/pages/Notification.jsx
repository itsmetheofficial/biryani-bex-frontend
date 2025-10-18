import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { callGetAPI } from '../api/apiHelper';
import { API_ENDPOINTS } from '../api/apiConfig';
import { message, Spin } from 'antd';
import moment from 'moment';

export default function Notification() {
    const [cookies,setCookies] = useCookies();
    const [loading,setLoading] = useState();
    const [notificationData,setNotificationData] = useState([]);

    useEffect(()=>{
        if(cookies?.token){ 
            fetchNotificationData(cookies.token);
        }
    },[cookies?.token])

    const fetchNotificationData =async(token)=>{
        setLoading(true);
        try{
            let res = await callGetAPI(API_ENDPOINTS.GET_NOTIFICATIONS, token);
            if(res?.success){
                setNotificationData(res?.data || []);
            }else{
                setNotificationData([])
                message.error(res?.message || "Failed to fetch notifications");
            }
        }catch(err){
            setNotificationData([])
            message.error("Failed to fetch notifications");
        }finally{
            setLoading(false)
        }
    }

  return (
    <div className="notificationPage">
       <div className="pageHeader">
            <img src="/images/notificationBell.svg" alt="" width={28} />
            <span>Notifications</span>
        </div>
        <div className="notificationList">
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
                notificationData?.length > 0 ?
                notificationData?.map((notification,)=>(
                    <div className="npItemOuter">
                        <div className="npItem">
                            <div className="npiIcon">
                                <img src="/images/notificationBell.svg" alt="" />
                            </div>
                            <div className="npiLeft">
                                <h4>{notification?.title || ""}</h4>
                                <p>{notification?.notification || ""}</p>
                            </div>
                            <div className="npiRight">
                                <p>{notification?.createdAt?.length ? moment(notification?.createdAt).format("DD/MM/YYYY | HH:mm:ss") : ""}</p>
                            </div>
                        </div>
                    </div>
                ))
                :
                <div style={
                    { 
                        padding: 20,
                        textAlign: "center",
                        color:"#fff",
                    }
                }>
                    No data found!
                </div>

            }
        </div>
    </div>
  )
}
