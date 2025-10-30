import { message, Spin } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SuccessModal from '../components/SuccessModal'
import { callPostAPI } from '../api/apiHelper'
import { useCookies } from 'react-cookie'
import { API_ENDPOINTS } from '../api/apiConfig'

export default function AddBankAccount() {
    const navigate = useNavigate()
    const [cookies] = useCookies();
    const [showSuccessModalVisible, setShowSuccessModalVisible] = useState(false)
    const [loading,setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        phone: '',
        mail: '',
        upiName: '',
        upiId: ''
    })

    const token = cookies?.token;
    const userId = cookies?.userDetails?.userId;

    const handleChange = (e) => {
        if(e.target.value.includes(" ") && e.target?.id !== "bankName" && e.target?.id !== "name") {
            return;
        }
        
        setFormData({
            ...(formData || {}),
            [e.target.name]: e.target.value
        })
    }

    const handleNumberInput = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validateIFSC = (code) => {
        const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
        return regex.test(code);
    };

    const handleSubmit = async () => {
        const { name, bankName, accountNumber, ifsc, phone, mail,upiName,upiId } = formData;

       

        if (!name?.trim()) return message.error('Please enter a valid Recipient’s Name');
        if (!bankName?.trim()) return message.error('Please enter a valid Bank Name');
        if (!accountNumber?.trim()) return message.error('Please enter a valid Account Number');
        if (!ifsc?.trim()) return message.error('Please enter a valid IFSC Code');
        if (!phone?.trim() || phone.length !== 10) return message.error('Please enter a valid 10-digit Phone Number');
        if (!validateEmail(mail)) return message.error('Please enter a valid Email Address');
        if (!upiName?.trim()) return message.error('Please enter a valid UPI Name');
        if (!upiId?.trim()) return message.error('Please enter a valid UPI ID');
        // if (!validateIFSC(ifsc)) return message.error('Please enter a valid IFSC Code');

        if (!token || !userId) {
            message.error("Session expired. Please login again.");
            navigate("/login");
            return;
        }

        const body = {
            bank: bankName,
            recipientName: name,
            accountNumber,
            phone,
            mail,
            ifsc,
            upiName,
            upiId
        };

        try {
            setLoading(true)
            const response = await callPostAPI(
                `${API_ENDPOINTS.ADD_BANK_DETAILS}?userId=${userId}&type=bank`,
                body,
                token,
                false,
            );

            if (response?.success) {
                setShowSuccessModalVisible(true);
                setFormData({
                    name: '',
                    bankName: '',
                    accountNumber: '',
                    ifsc: '',
                    phone: '',
                    mail: '',
                    upiName: '',
                    upiId: ''
                });

                setTimeout(() => {
                    setShowSuccessModalVisible(false);
                }, 2000);
            } else {
                message.error(response?.message || "Failed to add bank account");
            }
        } catch (error) {
            message.error(error?.message || "Something went wrong while adding bank account");
        }finally{
            setLoading(false)
        }
    }

    return (
        <div className='aboutUsPage privacyPolicyPage subordinateDataPage addAccountDetails addUPIAccountPage'>
            <div className="auHeaderOuter">
                <div className="auHeader">
                    <span>Add Bank Account</span>
                   <button onClick={() => navigate(-1)}>
                        <img src="/images/closeModalIcon.png" alt="" />
                    </button>
                </div>
            </div>
            <div className="aaDMethods">
                
                <div className="admTop">
                    Enter Bank Details
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
                        <label htmlFor="name">Full Recipient’s Name</label>
                        <input
                            id='name'
                            name='name'
                            type="text"
                            placeholder='Please Enter Your Name'
                            value={formData?.name || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="bankName">Bank Name</label>
                        <input
                            id='bankName'
                            name='bankName'
                            type="text"
                            placeholder='Please Enter Your Bank Name'
                            value={formData?.bankName || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="accountNumber">Account Number</label>
                        <input
                            id='accountNumber'
                            name='accountNumber'
                            type="text"
                            placeholder='Please Enter Your Account Number'
                            maxLength={16}
                            value={formData?.accountNumber || ""}
                            onChange={handleNumberInput}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="bankifsc">IFSC Code</label>
                        <input
                            id='bankifsc'
                            name='ifsc'
                            type="text"
                            placeholder='Please Enter Your Bank IFSC Code'
                            maxLength={11}
                            value={formData?.ifsc?.toUpperCase() || ""}
                            onChange={(e) => {
                                if (e.target.value.length > 11 || e.target.value?.includes(" ")) return
                                setFormData(prev => ({
                                    ...prev,
                                    ifsc: e.target.value.toUpperCase()
                                }));
                            }}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id='phone'
                            name='phone'
                            type="text"
                            maxLength={10}
                            placeholder='Please Enter Your Phone Number'
                            value={formData?.phone || ""}
                            onChange={handleNumberInput}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="mail">Email Address</label>
                        <input
                            id='mail'
                            name='mail'
                            type="email"
                            placeholder='Please Enter Your Email Address'
                            value={formData?.mail || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="upiName">UPI Name</label>
                        <input
                            id='upiName'
                            name='upiName'
                            type="text"
                            placeholder='Please Enter Your UPI Name'
                            value={formData?.upiName || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admFormItem">
                        <label htmlFor="upiId">UPI Id</label>
                        <input
                            id='upiId'
                            name='upiId'
                            type="text"
                            placeholder='Please Enter Your UPI Id'
                            value={formData?.upiId || ""}
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
            {/* <div className="ubiSideButtons">
                <div className="mwrBottom mbButtons">
                    <button>
                        <img src="/images/questionmarkIcon.png" alt="" style={{ width: "25px" }} />
                        <span>How to add Account</span>
                    </button>
                </div>
            </div> */}

            {showSuccessModalVisible &&
                <SuccessModal
                    open={showSuccessModalVisible}
                    setOpen={setShowSuccessModalVisible}
                    messageText={"Bank Account Added Successfully"}
                />
            }
        </div>
    )
}
