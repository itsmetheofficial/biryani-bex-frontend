import { message } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SuccessModal from '../components/SuccessModal'

export default function AddUPIAccount() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        upiName: '',
        upiId: ''
    })

    const [showSuccessModalVisible, setShowSuccessModalVisible] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = () => {

        if (!formData?.upiName?.trim()) {
            message.error('Please enter a valid UPI Name')
            return
        }

        if (!formData?.upiId?.trim()) {
            message.error('Please enter a valid UPI ID')
            return
        }

        // If validations pass
        setShowSuccessModalVisible(true)
        setFormData(null)

        setTimeout(() => {
            setShowSuccessModalVisible(false)
        }, 2000);
    }

    return (
        <div className='aboutUsPage privacyPolicyPage subordinateDataPage addAccountDetails addUPIAccountPage'>
            <div className="auHeaderOuter">
                <div className="auHeader">
                    <span>Add UPI Account</span>
                    <button onClick={() => navigate("/add-account-details")}>
                        <img src="/images/closeModalIcon.png" alt="Close" />
                    </button>
                </div>
            </div>
            <div className="aaDMethods">
                <div className="admTop">
                    Enter UPI Details
                </div>
                <div className="admForm">
                    <div className="admFormItem">
                        <label htmlFor="upiName">UPI Name</label>
                        <input
                            id='upiName'
                            name='upiName'
                            type="text"
                            placeholder='Please Enter Your Name'
                            value={formData?.upiName || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="upiId">UPI ID</label>
                        <input
                            id='upiId'
                            name='upiId'
                            type="text"
                            placeholder='Please Enter Your UPI ID'
                            value={formData?.upiId || ''}
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
                    messageText={"UPI Account Added Successfully"}
                />
            }
        </div>
    )
}
