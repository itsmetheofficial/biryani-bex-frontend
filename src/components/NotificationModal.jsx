import { Modal } from 'antd'
import React from 'react'

export default function NotificationModal({open,setOpen,notificationData}) {

  return (
    <Modal
        open={open}
        closeIcon={null} 
        onCancel={()=>setOpen(false)}
        footer={null} 
        className="history-depositModal customModal myAccountModal depositeFailed notificaitonModal"
        width={500}
    >
        <div className="cmHeader">
            <span>Notification</span>
        </div>
        <div className="cmBody">
            <div className="cmIcon">
                <img src="/images/bellicon.png" alt="" />
            </div>
            <h4>OFFICIAL TELEGRAM</h4>
            <div className="nmContent">
                <h2>
                    <img src="/images/notifcationIcon.png" alt="" />
                    <span>Important Announcement:</span>
                </h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                </p>
            </div>
            <button className='notificaionConfirm' onClick={()=>setOpen(false)}>
                Confrim
            </button>
        </div>
    </Modal>
  )
}
