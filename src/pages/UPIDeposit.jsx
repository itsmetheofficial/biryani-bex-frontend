import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { message, QRCode, Spin } from 'antd';
import DepositSucesssModal from '../components/DepositSucesssModal';
import { callPostAPI } from '../api/apiHelper';
import { Cookies } from 'react-cookie';
import { API_ENDPOINTS } from '../api/apiConfig';

export default function UPIDeposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount');
  const upiName = queryParams.get('upiname');
  const upi = queryParams.get('upi');
  const cookies = new Cookies();

  const [showDepositSuccessVisible, setShowDepositSuccessVisible] = useState(false);
  const [depositAlertData, setDepositAlertData] = useState(null);
  const [formData, setFormData] = useState({
    upi: upi || '',
    amount: amount || '',
    transactionId: '',
    screenshotUrl: null,
  });
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      upi: upi || '',
      amount: amount || '',
    }));
  }, [upi, amount]);

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        message.success('Copied to clipboard!');
      } catch (err) {
        message.error('Failed to copy!');
      }
    } else {
      message.warning('Clipboard copy not supported in this environment.');
    }
  };

  const handleDepositRequest = async () => {
      const { upi, amount, transactionId } = formData;
      
      if (!upi || !amount || !transactionId) {
          message.error('Please provide all required fields: UPI ID, Amount, and Transaction ID.');
          return;
        }
        
        const userId = cookies.get('userDetails')?.userId;
        const depositData = {
            userId,
            method: 'UPI',
            amount: parseInt(amount),
            address: upi,
            transactionId,
            screenshotUrl: formData.screenshotUrl,
        };
        
    setLoading(true)
    try {
      const response = await callPostAPI(API_ENDPOINTS?.CREATE_DEPOSITREQUEST, depositData, cookies.get('token'));

      if (response?.success) {
        const alertData = {
          message: response?.message || 'UPI Deposit Successful',
          amount: amount,
          page: 'UPI Deposit',
        };
        setDepositAlertData(alertData);
        setShowDepositSuccessVisible(true);

        setTimeout(() => {
            setShowDepositSuccessVisible(false)
            setDepositAlertData(null);
        }, 3000);
      } else {
        message.error('Deposit request failed: ' + response?.message);
      }
    } catch (error) {
      message.error('An error occurred while submitting the deposit request.');
    }finally{
        setLoading(false)
    }
  };

  const closeModal = () => {
    setShowDepositSuccessVisible(false);
    navigate('/deposit-history');
  };

   const buildUpiUrl = () => {
    const params = new URLSearchParams({
      pa: upi,
      pn: upiName,
      am: amount,
      cu: 'INR',
      // optionally note (tn), transaction reference (tr), etc
    });
    return `upi://pay?${params.toString()}`;
  };

   const qrValue = (upi && upiName && amount) ? buildUpiUrl() : '';

  return (
    <div className="aboutUsPage privacyPolicyPage UPIDeposit">
        {
            loading ?
                <div className='loadingOverData'>
                    <Spin size="large" tip="Loading" />
                </div>
                :null
        }
      <div className="auHeaderOuter">
        <div className="auHeader">
          <span>UPI Deposit</span>
          <button onClick={() => navigate(-1)}>
            <img src="/images/closeModalIcon.png" alt="" />
          </button>
        </div>
      </div>
      <div className="auBody">
        <div className="usdtBody">
          <div className="usdtBodyInner">
            <div className="ubiMainContent">
              <div className="umCTop">
                <div className="umCLeft">
                  <p>Depositing Amount</p>
                  <div className="priceContainerOuter">
                    <div className="priceContainer">
                      <div className="mhCurrency"><span>₹</span></div>
                      <p>{isNaN(amount) ? 0 : amount}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="umCQRSec">
                <p>ONLY DEPOSIT UPI PAYMENT ON THIS QR AND ADDRESS</p>
                <div className="umCQR">
                  {/* <img src="/images/umCQr.png" alt="" /> */}
                  <QRCode
                    value={qrValue}
                    color='#fff'
                    // other props like color, icon, etc
                  />
                  <p style={{textAlign:"center",margin:0}}>{upiName}</p>
                </div>
              </div>
              {/* <br />  */}
              <div className="umCBottom">
                <div className="walletAddress">
                  <p>UPI Address</p>
                  <div className="waInputContainerOuter">
                    <div className="waInputContainer">
                      <p>{formData.upi}</p>
                      <button onClick={() => copyToClipboard(formData.upi)}>COPY</button>
                    </div>
                  </div>
                </div>
                <div className="submitProof">
                  <p>UTR No</p>
                  <div className="spContainer">
                    <input
                      type="text"
                      placeholder="Enter UTR No"
                      value={formData.transactionId}
                      onChange={(e) => e.target.value?.includes(" ")?null: setFormData({ ...formData, transactionId: e.target.value })}
                      style={{width:"100%"}}
                      maxLength={12}
                       onKeyDown={(event) => {
                        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                        if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                    />
                    {/* <div className="spcButtonContainer">
                      <button>
                        <img src="/images/uploadIcon.png" alt="" />
                        <span>Upload <br />Screenshot</span>
                      </button>
                    </div>
                    <button className="seeExampleButton">
                      <img src="/images/questionmarkIcon.png" alt="" />
                      <p>See example</p>
                    </button> */}
                  </div>
                  <br />
                </div>
                <div className="spSubmitButton">
                  <button onClick={handleDepositRequest}>Confirm</button>
                </div>
                <br />
              </div>
            </div>
            {/* <div className="ubiSideButtons">
              <div className="mwrBottom mbButtons">
                <button>
                  <img src="/images/videoPauseIcon.png" alt="" />
                  <span>How to Deposit</span>
                </button>
                <button onClick={() => navigate('/deposit-history')}>
                  <img src="/images/depositIIcon.svg" alt="" />
                  <span>Deposit History</span>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {showDepositSuccessVisible && (
        <DepositSucesssModal open={showDepositSuccessVisible} setOpen={setShowDepositSuccessVisible} depositeData={depositAlertData} onClose={closeModal} />
      )}
    </div>
  );
}
