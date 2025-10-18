import { message, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DepositSucesssModal from '../components/DepositSucesssModal';
import { callPostAPI } from '../api/apiHelper';
import { Cookies, useCookies } from 'react-cookie';
import { API_ENDPOINTS } from '../api/apiConfig';

export default function UsdtDeposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount');
  const usdtWalletAddress = queryParams.get('usdtWalletAddress');
  const [cookies,setCookies] = useCookies();

  const [showDepositSuccessVisible, setShowDepositSuccessVisible] = useState(false);
  const [depositAlertData, setDepositAlertData] = useState(null);
  const [loading,setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: usdtWalletAddress || '',
    amount: amount || '',
    transactionId: '',
    screenshotUrl: null,
  });

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      address: usdtWalletAddress || '',
      amount: amount || '',
    }));
  }, [usdtWalletAddress, amount]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData((prevState) => ({
          ...prevState,
          screenshotUrl: file,
        }));
      } else {
        message.error('Only image files are allowed!');
      }
    }
  };

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

  const validateForm = () => {
    if (!formData.address) {
      message.error('USDT Wallet Address is required');
      return false;
    }
    if (!formData.amount) {
      message.error('Amount is required');
      return false;
    }
    if (!formData.transactionId) {
      message.error('Transaction ID is required');
      return false;
    }
    if (!formData.screenshotUrl) {
      message.error('Screenshot is required');
      return false;
    }
    return true;
  };

  const handleDepositRequest = async () => {
    if (!validateForm()) return;
    
    let payload = {
        ...formData,
        userId: cookies?.userDetails?.userId,
        method: 'USDT',
    }
    
    setLoading(true)
    try {
      const response = await callPostAPI(API_ENDPOINTS?.CREATE_DEPOSITREQUEST, payload, cookies?.token);

      if (response?.success) {
        const alertData = {
          message: response?.message ||'USDT Deposit Successful',
          amount: formData.amount,
          page: 'USDT Deposit',
        };
        setDepositAlertData(alertData);
        setShowDepositSuccessVisible(true);

        setTimeout(() => {
            setShowDepositSuccessVisible(false);
            setDepositAlertData(null);
        }, 3000);
      } else {
        message.error('Deposit request failed: ' + response?.message);
      }
    } catch (error) {
      message.error('An error occurred while submitting the deposit request.');
    }finally {
      setLoading(false)
    }
  };

  const closeModal = () => {
    setShowDepositSuccessVisible(false);
    navigate('/deposit-history');
  };

  return (
    <div className="aboutUsPage privacyPolicyPage usdtDeposit">
        {
            loading ?
                <div className='loadingOverData'>
                    <Spin size="large" tip="Loading" />
                </div>
                :null
        }
      <div className="auHeaderOuter">
        <div className="auHeader">
          <span>USDT Deposit</span>
          <button onClick={() => navigate('/deposit')}>
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
                      <img src="/images/greeDollarIcon.png" alt="" />
                      <p>{isNaN(amount) ? 0 : amount ? parseFloat(amount) / 100 : 0}</p>
                    </div>
                  </div>
                </div>
                <div className="umCRight">
                  <div className="umCRInner">1 USDT = ₹100</div>
                </div>
              </div>
              <div className="umCQRSec">
                {/* <p>ONLY DEPOSIT TRC20 USDT ON THIS QR AND ADDRESS</p>
                <div className="umCQR">
                  <img src="/images/umCQr.png" alt="" />
                </div> */}
              </div>
              <div className="umCBottom">
                <div className="walletAddress">
                  <p>Wallet Address</p>
                  <div className="waInputContainerOuter">
                    <div className="waInputContainer">
                      <p>{formData.address}</p>
                      <button onClick={() => copyToClipboard(formData.address)}>COPY</button>
                    </div>
                  </div>
                </div>
                <div className="submitProof">
                  <p>Submit Payment Proof</p>
                  <div className="spContainer">
                    <input
                      type="text"
                      placeholder="Please Enter Transaction ID Here"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    />

                    <div>
                      <div className="spcButtonContainer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          id="screenshotUpload"
                          style={{ display: 'none' }}
                        />
                        <button onClick={() => document.getElementById('screenshotUpload').click()}>
                          <img src="/images/uploadIcon.png" alt="" />
                          <span>Upload <br />Screenshot</span>
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', color: "#fff", margin: "10px 0 0" }}>
                        {formData.screenshotUrl && <div>{formData.screenshotUrl.name}</div>}
                      </div>
                    </div>

                    {/* <button className="seeExampleButton">
                      <img src="/images/questionmarkIcon.png" alt="" />
                      <p>See example</p>
                    </button> */}
                  </div>
                </div>
                <div className="spSubmitButton">
                  <button onClick={handleDepositRequest}>Confirm</button>
                </div>
              </div>
            </div>
            <div className="ubiSideButtons">
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
            </div>
          </div>
        </div>
      </div>

      {showDepositSuccessVisible && (
        <DepositSucesssModal open={showDepositSuccessVisible} setOpen={setShowDepositSuccessVisible} depositeData={depositAlertData} onClose={closeModal} />
      )}
    </div>
  );
}
