import { Button, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import MyAccount from "../pages/MyAccount";
import { useCookies } from "react-cookie";
import { BASE_URL } from "../api/apiConfig";
import { EditOutlined } from "@ant-design/icons";

const Sidebar = ({ collapsed, toggleMenu }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const currentPath = location.pathname; 
    const [myAccountModalVisible, setmyAccountModalVisible] = useState(false);
    const [cookies,setCookies] = useCookies();

    const handleNavigation = (path) => {
        navigate(path);
    };
    const _mobileSidebarClose =()=>{
        if(window.innerWidth<993){
            toggleMenu()
        }
    }

    const _closeMenuOnBlur =(e)=>{
         if(window.innerWidth<993){
            if(e.target?.classList?.contains("sider")){
                 toggleMenu()
            }
        }
    }

    // Define the menu items
    const menuItems = [
        {
            key: "1",
            className: "sider-menu-item",
            onClick: () =>{ handleNavigation("/");_mobileSidebarClose();},
            icon: <img src="/images/homeIcon.png" alt="" />,
            label: (
                <div className="menuItemInner">
                    <span>Home</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/",
        },
        {
            key: "2",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/my-bets");_mobileSidebarClose();},
            icon: <img src="/images/myBetsIcon.png" alt="" />,
            label: (
                <div className="menuItemInner">
                    <span>My Bets</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/my-bets",
        },
        {
            key: "3",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/game-statics");_mobileSidebarClose();},
            icon: <img src="/images/gameStaticsIcon.png" alt="" />,
            label: (
                <div className="menuItemInner">
                    <span>Game Statics</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/game-statics",
        },
        {
            key: "4",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/my-wallet");_mobileSidebarClose();},
            icon: <img src="/images/mywallet.png" alt="" />,
            label: (
                <div className="menuItemInner">
                    <span>My Wallet</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/my-wallet",
        },
        {
            key: "5",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/promotions");_mobileSidebarClose();},
            icon: <img src="/images/Promotions.png" alt="" />,
            label: (
                <div className="menuItemInner">
                    <span>Promotions</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/promotions",
        },
        {
            key: "6",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/offers");_mobileSidebarClose();},
            icon: <img src="/images/Offeres.png" alt="" />,
            label: (
                <div className="menuItemInner">
                    <span>Offers</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/offers",
        },
        {
            key: "7",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/daily-attendance");_mobileSidebarClose();},
            icon: <img src="/images/Daily-Attendance.png" alt="" width={25} />,
            label: (
                <div className="menuItemInner">
                    <span>Daily Attendance</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/daily-attendance",
        },
        {
            key: "8",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/recharge-bonus");_mobileSidebarClose();},
            icon: <img src="/images/Recharge-Bonus.png" alt="" width="25px" />,
            label: (
                <div className="menuItemInner">
                    <span>Recharge Bonus</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/recharge-bonus",
        },
        {
            key: "9",
            className: "sider-menu-item",
            onClick: () => {handleNavigation("/bet-commission");_mobileSidebarClose();},
            icon: <img src="/images/BetCommissionIon.svg" alt="" width={30} />,
            label: (
                <div className="menuItemInner">
                    <span>Bet Commision</span>
                </div>
            ),
            extra: <img src="/images/Polygon 2.png" alt="" />,
            path: "/bet-commission",
        },
    ];

    // Determine the active menu item based on the current URL path
    const selectedKey = menuItems.find(item => item.path === currentPath)?.key;

    return (
        <>
            <Sider className={`sider ${collapsed ? "sider-collapsed" : ""}`} onClick={_closeMenuOnBlur}>
                <div className="sider-header">
                    <div className="shTop">
                        <div className="shtMiddle">
                            <img src={cookies?.userDetails?.profileImage?.length ? `${BASE_URL}${cookies?.userDetails?.profileImage}` :"/images/proImage.png"} alt="" />
                        </div>
                        <div className="shtRight">
                            <Button
                                type="primary"
                                onClick={toggleMenu}
                                className="sider-button"
                            >
                                <img src="/images/leftArrowFilled.svg" alt="" />
                            </Button>
                        </div>
                    </div>
                    <div className="shBottom">
                        <div className="shName">
                            <span>
                                {console.log("cookies : ",cookies?.userDetails)}
                                {cookies?.userDetails?.name} 
                            </span>
                            <Button onClick={()=>setmyAccountModalVisible(true)}>
                                {/* <img src="/images/rightArrowIconRed.png" alt="" /> */}
                                <EditOutlined style={{color:"#fff",fontSize:20}} />
                            </Button></div>
                        <div className="shId">ID: {cookies?.userDetails?.userId}</div>
                    </div>
                </div>

                <Menu
                    className="sider-menu"
                    mode="inline"
                    selectedKeys={[selectedKey]} // Set the active menu item based on the URL
                    items={menuItems}
                />

                <div className="sider-header siderFooter">
                    <div className="sdfTop">
                        <img src="/images/additionalIcon.png" alt="" />
                        <span>Additional</span>
                    </div>
                    <div className="additionalUl">
                        <ul>
                            <li>
                                <button onClick={()=>navigate("/rules")}>Rules</button>
                                <button className="socialMediaLinks">
                                    <img src="/images/facebookIcon.png" alt="" />
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("/about")}>About Us</button>
                                <button className="socialMediaLinks">
                                    <img src="/images/instagramIcon.png" alt="" />
                                </button>
                            </li>
                            <li>
                                <button onClick={() => {navigate("/privacy-policy")}}>Terms & Condition</button>
                                <button className="socialMediaLinks">
                                    <img src="/images/youtubeIcon.png" alt="" />
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </Sider>
                {
                    myAccountModalVisible ?
                        <MyAccount open={myAccountModalVisible} setOpen = {setmyAccountModalVisible} />
                    :null
                }
        </>
    );
};

export default Sidebar;
