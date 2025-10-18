import { SearchOutlined } from '@ant-design/icons';
import { Select } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const {Option} = Select;

export default function AddAccountDetails() {
    const navigate = useNavigate()
  return (
    <div className='aboutUsPage privacyPolicyPage subordinateDataPage addAccountDetails'>
        <div className="auHeaderOuter">
            <div className="auHeader">
                <span>Add Account Details</span>
                <button onClick={() => navigate("/my-wallet")}>
                    <img src="/images/closeModalIcon.png" alt="" />
                </button>
            </div>
        </div>
        <div className="aaDMethods">
            <div className="admTop">
                Method
            </div>
            <div className="admBody">
                <div className="admbuttonOuter">
                    <button onClick={()=>navigate("/add-bank-account")}>
                        <span className="admButtonLeftImg">
                            <img src="/images/BankIIcon.png" alt="" />
                        </span>
                        <span>
                            Bank Account
                        </span>
                        <span className="admButtonRightImg">
                            <img src="/images/rightArrowButtonImg.png" alt="" />
                        </span>
                    </button>
                </div>
                {/* <div className="admbuttonOuter">
                    <button onClick={()=>navigate("/add-upi-account")}>
                        <span className="admButtonLeftImg">
                            <img src="/images/UPIImages.png" alt="" />
                        </span>
                        <span>
                        UPI ID
                        </span>
                        <span className="admButtonRightImg">
                            <img src="/images/rightArrowButtonImg.png" alt="" />
                        </span>
                    </button>
                </div> */}
                <div className="admbuttonOuter">
                    <button onClick={()=>navigate("/add-usdt-account")}>
                        <span className="admButtonLeftImg">
                            <img src="/images/udptLOgo.png" alt="" />
                        </span>
                        <span>
                        USDT TRC20
                        </span>
                        <span className="admButtonRightImg">
                            <img src="/images/rightArrowButtonImg.png" alt="" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <div className="ubiSideButtons">
            <div className="mwrBottom mbButtons">
                <button>
                    <img src="/images/questionmarkIcon.png" alt="" style={{width:"25px"}} />
                    <span>How to add Account</span>
                </button>
            </div>
        </div>
    </div>
  )
}
