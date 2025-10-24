import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Rules() {
    const navigate = useNavigate()
  return (
    <div className='aboutUsPage privacyPolicyPage'>
        <div className="auHeaderOuter">
            <div className="auHeader">
                <span>Rules</span>
                <button onClick={() =>  navigate(-1)}>
                    <img src="/images/closeModalIcon.png" alt="" />
                </button>
            </div>
        </div>
        <div className="auBody">
            <div className="auBodyInner">
                <div className="auItem">
                    <h4>Community Rules</h4>
                    <p>
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
                        The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.
                    </p>
                </div>
                <div className="auItem">
                    <h4>Code of Conduct</h4>
                    <p>
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
                        The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.
                    </p>
                </div>
                </div>

        </div>
        <div className="auBottom">
            <div className="aubLeft">
                <div className="socialMediaLinks">
                    <button>
                        <img src="/images/facebookIconn.svg" alt="" />
                    </button>
                    <button>
                        <img src="/images/instagramIconn.svg" alt="" />
                    </button>
                    <button>
                        <img src="/images/linkediniconn.svg" alt="" />
                    </button>
                    <button>
                        <img src="/images/youtubeIconn.svg" alt="" />
                    </button>
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
