import { Modal } from 'antd'
import React from 'react'

export default function DepositSucesssModal({open,setOpen,depositeData}) {

  return (
    <Modal
        open={open}
        closeIcon={null} 
        onCancel={()=>setOpen(false)}
        footer={null} 
        className="history-depositModal customModal myAccountModal"
        width={500}
    >
        <div className="cmHeader">
            <span>{depositeData?.page || "Success"}</span>
            <button onClick={()=>setOpen(false)}>
                <img src="/images/closeIcon.svg" alt="" />
            </button>
        </div>
        <div className="cmBody">
            <div className="cmIcon">
                <img src="/images/depositSuccess.png" alt="" />
            </div>
            <div className="cmPrice">
                {depositeData?.page==="USDT Deposit"?"$":"₹"} {depositeData?.page==="USDT Deposit"?depositeData?.amount/100:depositeData?.amount}
            </div>
            <div className="cmMessage">
                {depositeData?.message}
            </div>
        </div>
    </Modal>
  )
}
