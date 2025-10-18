import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PasswordReset() {
    const navigate = useNavigate();
    const [password,setpassword] = useState("")
  return (
    <div className="loginPage signUpPage passwordResetPage">
        <div className="wrapper">
            <div className="loginPageInner">
                <div className="signUplogo">
                    <img src="/images/siteLogo.svg" alt="" />
                </div>
                <div className="lpLeft lpLeftTop">
                    <h4>Password Reset</h4>
                    <p>Reset Your Password</p>
                </div>
                <div className="lpLeft">
                    <div className="lplForm">
                        <div className="lplFormItem">
                            <label htmlFor="email">
                                <img src="/images/mailWhite.svg" alt="" />
                                <span>Email ID</span>
                            </label>
                            <div className="lplInputField">
                                <input type="text" id="email" placeholder="Enter Your Name Here" />
                                <button>Send OTP</button>
                            </div>
                        </div>
                        <div className="lplFormItem">
                            <label htmlFor="password">
                                <img src="/images/lockIcon.svg" alt="" />
                                <span>New Password</span>
                            </label>
                            <input type="text"id="password" placeholder="Enter Your Password Here" value={"*".repeat(password.length)} onChange={(e)=>setpassword(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="plRight">
                <div className="lplForm">
                        <div className="lplFormItem">
                            <label htmlFor="email">
                                <span>Enter OTP</span>
                            </label>
                            <input type="text" id="email" placeholder="Enter Your OTP Here" />
                        </div>
                        <div className="lplFormItem">
                            <label htmlFor="password">
                                <img src="/images/lockIcon.svg" alt="" />
                                <span>Confirm Password</span>
                            </label>
                            <input type="text"id="password" placeholder="Re-Enter Your Password Here" value={"*".repeat(password.length)} onChange={(e)=>setpassword(e.target.value)} />
                        </div>                       
                    </div>
                </div>
                <div className="spButtons lplButtons">
                    <div className="spbLeft">
                        <button className="login" onClick={()=>navigate("/login")}>
                            <span>Confirm</span>
                            <img src="/images/rightArrowWhiteOutLIned.svg" alt="" />
                        </button>
                    </div>
                    <div className="spbRight">
                        <div className="lplForgotPassword">
                            <button onClick={()=>navigate("/login")}>
                                <span>Already have an Account? Login</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
