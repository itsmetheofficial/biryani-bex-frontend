import { Modal } from 'antd'
import moment from 'moment'
import React from 'react'

export default function VeiwDetailsModal({open,closeModal,record}) {

  return (
    <Modal
        open={open}
        closeIcon={null} 
        onCancel={()=>closeModal()}
        footer={null} 
        className="history-depositModal customModal myAccountModal depositDetailsModal"
        width={600}
    >
        <div className="cmHeader">
            <span>{record?.paymentMode+ " " +record?.transactionType}</span>
            <button onClick={()=>closeModal()}>
                <img src="/images/closeIcon.svg" alt="" />
            </button>
        </div>
        <div className="cmBody">
            <div className="ddItemsContainer">
                <div className="ddItem">
                    <div className="ddiLeft">Type :</div>
                    <div className="ddiRightOuter">
                        <div className="ddiRight">
                            {record?.transactionType?.length>0 ? record?.transactionType : "N/A"}
                        </div>
                    </div>
                </div>
                <div className="ddItem">
                    <div className="ddiLeft">Order ID :</div>
                    <div className="ddiRightOuter">
                        <div className="ddiRight">
                            {record?.transactionId?.length>0 ? record?.transactionId : "N/A"}
                        </div>
                    </div>
                </div>
                <div className="ddItem">
                    <div className="ddiLeft">Time :</div>
                    <div className="ddiRightOuter">
                        <div className="ddiRight">
                            {record?.createdAt?.length>0 ? moment(record?.createdAt).format("DD-MM-YYYY HH:mm") : "--/--/-- --:--"}
                        </div>
                    </div>
                </div>
                <div className="ddItem">
                    <div className="ddiLeft">Balance :</div>
                    <div className="ddiRightOuter">
                        <div className="ddiRight">
                            ₹{record?.remainingBalance ||0}
                        </div>
                    </div>
                </div>
                <div className="ddItem">
                    <div className="ddiLeft">Status :</div>
                    <div className="ddiRightOuter">
                        <div className={"ddiRight " + (record?.status)}>
                            {record?.status?.length>0 ? record?.status : "N/A"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
  )
}
