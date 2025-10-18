import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Offers() {
    const navigate = useNavigate();
  return (
    <div className="offersPage">
        <div className="pageHeader">
            <img src="/images/OffersPageIcon.svg" alt="" width={40} />
            <span>Offers</span>
        </div>
        <div className="opOffersList">
            <div className="opOfferItem" onClick={()=>navigate("/recharge-bonus")}>
                <img src="/images/Offer1.png" alt="" />
                <h4>Recharge <br /> Bonus</h4>
            </div>
            <div className="opOfferItem"  onClick={()=>navigate("/bet-commission")}>
                <img src="/images/Offer2.png" alt="" />
                <h4>Bet <br />
                Commission</h4>
            </div>
            <div className="opOfferItem" onClick={()=>navigate("/daily-salary-system")}>
                <img src="/images/Offer3.png" alt="" />
                <h4>Salary <br />
                System</h4>
            </div>
            <div className="opOfferItem" onClick={()=>navigate("/daily-salary-system")}>
                <img src="/images/Offer4.png" alt="" />
                <h4>3 level <br />
                income</h4>
            </div>
        </div>
    </div>
  )
}
