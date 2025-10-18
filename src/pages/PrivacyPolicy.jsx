import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy({allSettings}) {
    const navigate = useNavigate()
  return (
    <div className='aboutUsPage privacyPolicyPage'>
        <div className="auHeaderOuter">
            <div className="auHeader">
                <span>Privacy & Policy</span>
                <button onClick={() =>  navigate("/")}>
                    <img src="/images/closeModalIcon.png" alt="" />
                </button>
            </div>
        </div>
        <div className="auBody">
            <div className="auBodyInner">
                <div className="auItem">
                    <h4>Privacy & Policy</h4>
                    <p>
                        {allSettings?.privacyPolicy}
                    </p>
                </div>
                <div className="auItem">
                    <h4>Terms & Condition</h4>
                    <p>
                        {allSettings?.termsAndConditions}
                    </p>
                </div>
            </div>
        </div>
        <div className="auBottom">
            <div className="aubLeft">
                <div className="socialMediaLinks">
                    <a href={allSettings?.socialMedia?.facebook || null}>
                        <img src="/images/facebookIconn.svg" alt="" />
                    </a>
                    <a href={allSettings?.socialMedia?.instagram || null}>
                        <img src="/images/instagramIconn.svg" alt="" />
                    </a>
                    <a href={allSettings?.socialMedia?.linkedin || null}>
                        <img src="/images/linkediniconn.svg" alt="" />
                    </a>
                    <a href={allSettings?.socialMedia?.youtube || null}>
                        <img src="/images/youtubeIconn.svg" alt="" />
                    </a>
                </div>
                <p>
                    Follow Us <br />
                    On our social media platform
                </p>
            </div>
            <div className="aubRight">
                <p>
                    For more details or and inquiry <br />
                    contact us
                </p>
                <button onClick={()=>navigate("/?chatopen=true")}>
                    <img src="/images/supportIcon.svg" alt="" />
                </button>
            </div>
        </div>
    </div>
  )
}
