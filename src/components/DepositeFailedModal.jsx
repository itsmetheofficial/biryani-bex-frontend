import { Modal } from 'antd'
import React from 'react'

export default function DepositeFailedModal({open,setOpen,depositeData}) {

  return (
    <Modal
        open={open}
        closeIcon={null} 
        onCancel={()=>setOpen(false)}
        footer={null} 
        className="history-depositModal customModal myAccountModal depositeFailed"
        width={500}
    >
        <div className="cmHeader">
            <span>Alert</span>
            <button onClick={()=>setOpen(false)}>
                <img src="/images/closeIcon.svg" alt="" />
            </button>
        </div>
        <div className="cmBody">
            <div className="cmIcon">
                <img src="/images/depositFailed.png" alt="" />
            </div>
            <div className="cmMessage" dangerouslySetInnerHTML={{__html:depositeData?.message}}>
                
            </div>
        </div>
    </Modal>
  )
}
