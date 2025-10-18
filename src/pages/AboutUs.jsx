import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AboutUs({allSettings}) {
    const navigate = useNavigate()
  return (
    <div className='aboutUsPage'>
        <div className="auHeaderOuter">
            <div className="auHeader">
                <span>About Us</span>
                <button onClick={() => navigate("/")}>
                    <img src="/images/closeModalIcon.png" alt="" />
                </button>
            </div>
        </div>
        <div className="auBody">
            <div className="auItem">
                <h4>About the Game</h4>
                <p>
                    {allSettings?.aboutTheGame}
                </p>
            </div>
            <div className="auItem">
                <h4>Our Vision</h4>
                <p>
                    {allSettings?.vision}
                </p>
            </div>
        </div>
        <div className="auBottom">
            <div className="aubLeft">
                <div className="socialMediaLinks">
                    <a href={allSettings?.socialMedia?.facebook || null}>
                        <img src="/images/facebookIconn.svg" alt="" />
                    </a>
                    <a href={allSettings?.socialMedia?.facebook || null}>
                        <img src="/images/instagramIconn.svg" alt="" />
                    </a>
                    <a href={allSettings?.socialMedia?.facebook || null}>
                        <img src="/images/linkediniconn.svg" alt="" />
                    </a>
                    <a href={allSettings?.socialMedia?.facebook || null}>
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
