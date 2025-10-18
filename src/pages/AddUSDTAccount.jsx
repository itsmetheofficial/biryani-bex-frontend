import { message, Spin } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SuccessModal from '../components/SuccessModal'
import { useCookies } from 'react-cookie'
import { callPostAPI } from '../api/apiHelper'
import { API_ENDPOINTS } from '../api/apiConfig'

export default function AddUSDTAccount() {
    const navigate = useNavigate()
    const [cookies] = useCookies()
    const [showSuccessModalVisible, setShowSuccessModalVisible] = useState(false)
    const [loading,setloading] = useState(false)

    const [formData, setFormData] = useState({
        walletAddress: '',
        alias: ''
    })

    const token = cookies?.token
    const userId = cookies?.userDetails?.userId
    

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) {
                setFormData(prev => ({ ...prev, walletAddress: text }))
                message.success("Pasted from clipboard")
            } else {
                message.warning("Clipboard is empty")
            }
        } catch (err) {
            message.error("Failed to read from clipboard")
        }
    }

    const handleSubmit = async () => {
        const { walletAddress, alias } = formData

        if (!walletAddress?.trim()) {
            return message.error('Please enter a valid TRC20 Wallet Address')
        }

        if (!alias?.trim()) {
            return message.error('Please enter a valid Address Alias')
        }

        if (!token || !userId) {
            message.error("Session expired. Please login again.")
            navigate("/login")
            return
        }

        const body = {
            usdtAddress: walletAddress,
            addressAlias: alias,
            network: "TRC20"
        }

        try {
            setloading(true)
            const response = await callPostAPI(
                `${API_ENDPOINTS.ADD_BANK_DETAILS}?userId=${userId}&type=usdt`,
                body,
                token,
                false,
            )

            if (response?.success) {
                setShowSuccessModalVisible(true)
                setFormData({
                    walletAddress: '',
                    alias: ''
                })

                setTimeout(() => {
                    setShowSuccessModalVisible(false)
                }, 2000)
            } else {
                message.error(response?.message || "Failed to add USDT wallet address")
            }
        } catch (error) {
            message.error(error?.message || "Something went wrong while adding wallet address")
        }finally{
            setloading(false)
        }
    }

    return (
        <div className='aboutUsPage privacyPolicyPage subordinateDataPage addAccountDetails addUPIAccountPage addUsdtAccountPage'>
            <div className="auHeaderOuter">
                <div className="auHeader">
                    <span>Add USDT Address</span>
                    <button onClick={() => navigate("/add-account-details")}>
                        <img src="/images/closeModalIcon.png" alt="" />
                    </button>
                </div>
            </div>
            <div className="aaDMethods">
                
                <div className="admTop">
                    TETHER USDT (TRC20) NETWORK WITHDRAWAL
                </div>
                <div className="admForm" style={{position:"relative"}}>
                    {
                        loading ?
                            <div className='loadingOverData'>
                                <Spin size="large" tip="Loading" />
                            </div>
                            :null
                    }
                    <div className="admFormItem">
                        <label htmlFor="walletAddress">TRC20 Wallet Address</label>
                        <div className="admFormInputContainer">
                            <input
                                id='walletAddress'
                                name='walletAddress'
                                type="text"
                                placeholder='Please Enter Your Wallet Address'
                                value={formData?.walletAddress || ''}
                                onChange={handleChange}
                            />
                            <button type="button" onClick={handlePaste}>Paste</button>
                        </div>
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="address">Address Alias</label>
                        <input
                            id='address'
                            name='alias'
                            type="text"
                            placeholder='Please enter a remark of the withdrawal address'
                            value={formData?.alias || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admSubmitButton spSubmitButton">
                        <button onClick={handleSubmit}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
            <div className="ubiSideButtons">
                <div className="mwrBottom mbButtons">
                    <button>
                        <img src="/images/questionmarkIcon.png" alt="" style={{ width: "25px" }} />
                        <span>How to add Account</span>
                    </button>
                </div>
            </div>

            {
                showSuccessModalVisible &&
                <SuccessModal
                    open={showSuccessModalVisible}
                    setOpen={setShowSuccessModalVisible}
                    messageText={"USDT Wallet Address Added Successfully"}
                />
            }
        </div>
    )
}
