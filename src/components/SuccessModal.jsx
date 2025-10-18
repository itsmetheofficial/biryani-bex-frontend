import { Modal } from 'antd'
import React from 'react'

export default function SuccessModal({open,setOpen,messageText}) {

  return (
    <Modal
        open={open}
        closeIcon={null} 
        onCancel={()=>setOpen(false)}
        footer={null} 
        className="history-depositModal customModal myAccountModal successModal"
        width={500}
    >
        <div className="cmHeader">
            <span>Updated</span>
            <button onClick={()=>setOpen(false)}>
                <img src="/images/closeIcon.svg" alt="" />
            </button>
        </div>
        <div className="cmBody">
            <div className="cmIcon">
                <img src="/images/successIcon.png" alt=""/>
            </div>
            <div className="cmMessage">
                {messageText || "Updated Successfully"}
            </div>
        </div>
    </Modal>
  )
}
