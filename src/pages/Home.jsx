import React, { useEffect, useState } from 'react';
import { Carousel, Button, Table, Spin, message } from 'antd';
import NotificationModal from '../components/NotificationModal';
import { useCookies } from 'react-cookie';
import { callGetAPI, callPostAPI } from '../api/apiHelper';
import { API_ENDPOINTS, BASE_URL } from '../api/apiConfig';
import Base from 'antd/es/typography/Base';
import { load } from 'react-cookies';

export default function Home({isChatOpen}) {
    const topSlider = React.createRef();
    const [cookies,setCookies] = useCookies();
    const topGameSlider = React.createRef();
    const trendingGameSlider = React.createRef();
    const trendingGameSlider2 = React.createRef();
    const [topEarningTableData,settopEarningTableData] = useState([])
    const [notificaitonModalVisible,setNotificaitonModal] = useState(false);
    const [tgFilter,settgFilter] = useState("");
    const [gameCategories, setGameCategories] = useState([]);
    const [allGameList,setAllGameList] = useState([]);
    const [filteredGameList,setFilteredGameList] = useState([]);
    const [topGameList,setTopGameList] = useState([]);
    const [liveWithdrawalsData,setLiveWithdrawalsData] = useState([]);
    const [homePageDetailsData,setHomePageDetailsData] = useState([]);
    const [allLiveWithdrawalsData,setAllLiveWithdrawalsData] = useState([]);
    const [loading,setLoading] =useState({
        liveWithdrawal:false,
        homePageDetails:false,
        topGames:false,
        allGames:false,
        filteredGames:false,
        earningChart:false,
        goToGameLoadingId:null,
    })

     useEffect(() => {
        if (!allLiveWithdrawalsData.length) return;

        const dataLength = allLiveWithdrawalsData.length;

        let liveChartDataIndex =0;
        const updateData = () => {
            let nextData = [];

            // Fill nextData with exactly 10 items, wrapping if needed
            for (let i = 0; i < 10; i++) {
                nextData.push(allLiveWithdrawalsData[(liveChartDataIndex + i) % dataLength]);
            }

            setLiveWithdrawalsData(nextData);

            // Move forward by 10, but wrap cleanly after showing all items
            if (liveChartDataIndex + 10 >= dataLength) {
                liveChartDataIndex = (liveChartDataIndex + 10) % dataLength
            } else {
                liveChartDataIndex = liveChartDataIndex + 10
            }
        };

        updateData();
        const interval = setInterval(updateData, 3000);

        return () => clearInterval(interval);
    }, [ allLiveWithdrawalsData]);

    useEffect(()=>{
        setTimeout(() => {
            setCookies("notification",false,{path:"/"})
        }, 3000);
    },[])    
    
    useEffect(()=>{
        if(cookies?.notification){
            setNotificaitonModal(true)
        }else{
            setNotificaitonModal(false)
        }     
    },[cookies])

    useEffect(()=>{
        const token = cookies?.token;
        if (token) {
            fetchGameCategories(token);
            fetchAllGames(token);
            fetchLiveWithdrawalsData(token)
            fetchHomePageDetails(token)
            fetchTodayEarningChart(token)
        }else{
            console.warn("No token found");
        }
    },[])

    const fetchGameCategories = async (token) => {
        try {
            const res = await callGetAPI(API_ENDPOINTS.GET_CATEGORIES, token);
            if (res?.status) {
                setGameCategories(res?.data);
            }else{
                setGameCategories([])
            }
        } catch (err) {
            console.error("Error fetching game categories:", err);
        }
    };

    const fetchAllGames = async(token)=> {
        setLoading((prev)=>({...prev,allGames:true}));
        settgFilter("")
        try {

            const res = await callGetAPI(API_ENDPOINTS.GET_ALL_GAMES, token);

            if (res?.status) {
                setAllGameList(res?.data);
                setFilteredGameList(res?.data);
                let topGames = res?.data?.filter((game) => game?.category?.some((category) => category?.category === "top Games"||category?.category === "Top Games"));
                setTopGameList(topGames);
            }else{
                setAllGameList([])
                setFilteredGameList([])
            }
        } catch (err) {
            console.error("❌ Error fetching all games:", err);
            setAllGameList([])
            setFilteredGameList([])
        }finally{
             setLoading((prev)=>({...prev,allGames:false}));            
        }
    }

    const fetchGamesByCategories = async(category)=>{
        setLoading((prev)=>({...prev,filteredGames:true}));
        try{
        const token = cookies?.token;
            if(!token){
                console.warn("No token found");
                return;
            }
            const res = await callGetAPI(API_ENDPOINTS.GET_GAMES_BY_CATEGORY(category),token)

            if (res?.status) {
                return res?.data;
            }else{
                return [];
            }
        }catch(err){
            console.error("❌ Error fetching games by category:", err);
            return [];
        }finally{
            setLoading((prev)=>({...prev,filteredGames:false}));
        }
    }

    const fetchLiveWithdrawalsData = async (token)=>{
        setLoading(prev=>({...prev,liveWithdrawal:true}));
        try{
            let res = await callGetAPI(API_ENDPOINTS.GET_LIVE_WITHDRAWALS,token)
            if(res?.success){
                setAllLiveWithdrawalsData(res?.data)
            }else{
                setAllLiveWithdrawalsData([])
            }            
        }catch{
            setAllLiveWithdrawalsData([])
        }finally{
            setLoading(prev=>({...prev,liveWithdrawal:false}));
        }
    }

    const fetchHomePageDetails = async (token) =>{
        setLoading(prev=>({...prev,homePageDetails:true}));

        try{
            let res = await callGetAPI(API_ENDPOINTS.GET_HOMEPAGE_DETAILS,token)
            if(res?.success){
                setHomePageDetailsData(res?.data)
            }else{
                setHomePageDetailsData([])
            }            
        }catch{
            setHomePageDetailsData([])
        }finally{
            setLoading(prev=>({...prev,homePageDetails:false}));
        }
    }

    const fetchTodayEarningChart = async (token) => {
        setLoading(prev=>({...prev,earningChart:true}));
        try{
            const res = await callGetAPI(API_ENDPOINTS.TODAY_EARNING_CHART, token);
            if (res?.status) {
                settopEarningTableData(res?.data);
    
            }else{
                message.error(res?.message || "Failed to fetch today earning chart");
                settopEarningTableData([]);
            }    

        }catch{
            message.error("Failed to fetch today earning chart");
            settopEarningTableData([]);
        }finally{
            setLoading(prev=>({...prev,earningChart:false}));
        }
    }

    const goToNextTopGame = () => {
      topGameSlider.current.next();
    };
  
    const goToPrevTopGame = () => {
      topGameSlider.current.prev();
    };
    const goToNextTrendingGame = () => {
      trendingGameSlider.current.next();
    };
  
    const goToPrevTrendingGame = () => {
      trendingGameSlider.current.prev();
    };

    const _filterTrandingGames= async(e)=>{
        if(e===tgFilter){
            settgFilter("");
            setFilteredGameList(allGameList);
        }else{
            let gameData = await fetchGamesByCategories(e);
            setFilteredGameList(gameData);
            settgFilter(e);
        }
    }

    const goToGame =async(game,loadingId)=>{
        let gameType = game?.name;
        let return_url = window.location.href;
        let userId = cookies?.userDetails?.userId;
        let token = cookies?.token;

        setLoading(prev=>({...prev,goToGameLoadingId:loadingId}));
        try{
            const response = await callPostAPI(API_ENDPOINTS.REDIRECT_ON_GAME(userId), { gameType, return_url},token);
            if(response?.redirectUrl){
                 window.open(response?.redirectUrl, '_blank', 'noopener,noreferrer');
            }else{
                message.error("Something went wrong!")
            }
        }catch(err){
            message.error("Something went wrong!")
        }finally{
            setLoading(prev=>({...prev,goToGameLoadingId:null}));            
        }
    }

    return (
        <div className={`homePage ${isChatOpen?"chatOpenHome":""}`}>
            
                {
                    loading?.homePageDetails ?
                        <div style={{
                            height:100,
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"
                        }}>
                            <Spin />
                        </div>
                    :
                    homePageDetailsData?.bannerLogo?.length>0 ?
                        <div className="topOffers" style={homePageDetailsData?.bannerLogo?.length===1 && window.innerWidth>768? {maxWidth:"50%",marginLeft:"auto",marginRight:"auto"}:{}}>
                            <Carousel
                                ref={topSlider}
                                slidesToShow={homePageDetailsData?.bannerLogo?.length===1?1:2}
                                slidesToScroll={1}
                                dots={false}
                                infinite
                                beforeChange={(current, next) => {}}
                                responsive={[
                                    {
                                        breakpoint: 480,
                                        settings: {
                                            slidesToShow: 1,
                                        },
                                    },
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToShow: 1,
                                        },
                                    },
                                ]}
                                autoplay 
                                autoplaySpeed={3000} 
                                speed={500}
                                centerMode={true} 
                                centerPadding="0" 
                                >
                                    {
                                        homePageDetailsData?.bannerLogo?.map((image,index)=>(
                                            <div className="toItem" key={index}>
                                                <img src={BASE_URL+"/Images/"+image} alt="" />
                                            </div>
                                        ))
                                    }                      
                            </Carousel>
                        </div>
                    :null

                }
            <div className="topGames">
                <div className="tgTop sliderHeading">
                    <div className="shLeft">
                        <img src="/images/sliderHeaderIcon.svg" alt="" />
                        <span>Top Games</span>
                    </div>
                    <div className="shRight">
                        <Button onClick={goToPrevTopGame} >
                            <img src="/images/shLeftArrowButton.png" alt="" />
                        </Button>
                        <Button onClick={goToNextTopGame} >
                            <img src="/images/shRightArrowButton.png" alt="" />
                        </Button>
                    </div>
                </div>
                <div className='gameSlider' style={{position:"relative"}}>
                    {
                        loading?.allGames ?
                            <div className='loadingOverData'>
                                <Spin size="large" tip="Loading" />
                            </div>
                        :null
                    }
                    {
                        topGameList?.length>0 ?
                            <Carousel
                                ref={topGameSlider}
                                slidesToShow={5}
                                slidesToScroll={1}
                                dots={false}
                                infinite
                                beforeChange={(current, next) => {}}
                                responsive={[
                                    {
                                        breakpoint: 480,
                                        settings: {
                                            slidesToShow: 2,
                                        },
                                    },
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToShow: 3,
                                        },
                                    },
                                    {
                                        breakpoint: 1500,
                                        settings: {
                                            slidesToShow: isChatOpen?4:5,
                                        },
                                    },
                                    {
                                        breakpoint: 1400,
                                        settings: {
                                            slidesToShow: isChatOpen?4:5,
                                        },
                                    },
                                    {
                                        breakpoint: 1200,
                                        settings: {
                                            slidesToShow: 4,
                                        },
                                    },
                                ]}
                                autoplay 
                                autoplaySpeed={3500} 
                                speed={600}
                                className="custom-carousel"
                            >
                                {
                                    topGameList?.map((game,index)=>(
                                        <div className="gameSlideOuter" key={index}>
                                            <div className="gameSlide">
                                                <div className="gsBg">
                                                    <img src={BASE_URL + "/Images/" + game?.gameLogo} alt={game?.altName} />
                                                </div>
                                                <div className="gsBottom red">
                                                    <span>
                                                        {game?.name}
                                                    </span>
                                                    <button disabled={loading?.goToGameLoadingId===`topGame-${index}`} onClick={()=>goToGame(game,`topGame-${index}`)} style={{position:"relative"}}>
                                                        {loading?.goToGameLoadingId===`topGame-${index}` ? "Joining...":"Join Now"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))

                                }
                            </Carousel>
                        :<p style={{textAlign:"center",fontSize:18,color:"#fff",margin:"40px 0 60px"}}>
                            No Game Found
                        </p>
                    }                  
                  
                </div>
            </div>
            <div className="trendingGames">
                <div className="tgTop sliderHeading">
                    <div className="shLeft">
                        <img src="/images/sliderHeaderIcon.svg" alt="" />
                        <span>More Trending Games</span>
                    </div>
                    <div className="shRight">
                        <Button onClick={goToPrevTrendingGame} >
                            <img src="/images/shLeftArrowButton.png" alt="" />
                        </Button>
                        <Button onClick={goToNextTrendingGame} >
                            <img src="/images/shRightArrowButton.png" alt="" />
                        </Button>
                    </div>
                </div>
                <div className="tgbuttonsOuter">
                    <div className="tgButtons">
                        {
                            gameCategories?.length>0 ?
                                gameCategories?.map((item, index) => (
                                    <button key={item?._id || index} onClick={()=>_filterTrandingGames(item?._id)} className={tgFilter===item?._id?"active":""}>
                                        <img src={BASE_URL+ "/Images/" +item?.categoryIcon} alt={item?.altName} />
                                        {item?.category || item?.altName}
                                    </button>
                                ))
                            :null
                        }
                    </div>
                </div>
                <div className='gameSlider' style={{position:"relative"}}>
                    {
                        loading?.allGames || loading?.filteredGames ?
                            <div className='loadingOverData'>
                                <Spin size="large" tip="Loading" />
                            </div>
                         :null
                    }
                    {
                        filteredGameList?.length>0 ?
                            <Carousel
                                ref={trendingGameSlider}
                                slidesToShow={6}
                                slidesToScroll={1}
                                dots={false}
                                infinite
                                beforeChange={(current, next) => {}}
                                responsive={[
                                    {
                                    breakpoint: 480,
                                    settings: {
                                        slidesToShow: 3,
                                    },
                                    },
                                    {
                                    breakpoint: 768,
                                    settings: {
                                        slidesToShow: 4,
                                    },
                                    },
                                    {
                                        breakpoint: 1500,
                                        settings: {
                                            slidesToShow: isChatOpen?5:6,
                                        },
                                    },
                                    {
                                        breakpoint: 1400,
                                        settings: {
                                            slidesToShow: isChatOpen?4:6,
                                        },
                                    },
                                    {
                                        breakpoint: 1200,
                                        settings: {
                                            slidesToShow: 4,
                                        },
                                    },
                                ]}
                                className="custom-carousel"
                            >
                            {
                                filteredGameList?.map((game,index)=>(
                                    <div className="tgSlide" key={index} onClick={()=>goToGame(game,`allGames-${index}`)}>
                                            <img src={BASE_URL+"/Images/"+game?.gameLogo}alt="" />
                                            {
                                                loading?.goToGameLoadingId=== `allGames-${index}` ?
                                                    <div className='loadingOverData'>
                                                        <Spin size="large" tip="Loading" />
                                                    </div>
                                                :null
                                            }
                                    </div>

                                ))
                            } 
                            </Carousel>
                        :<p style={{textAlign:"center",fontSize:18,color:"#fff",margin:"40px 0 60px"}}>No Game Found</p>
                    }
                  
                </div>
            </div>
            
            {/* <div className="upcomingGames">
                 <Carousel
                        ref={trendingGameSlider2}
                        slidesToShow={6}
                        slidesToScroll={1}
                        dots={false}
                        infinite
                        beforeChange={(current, next) => {}}
                        responsive={[
                            {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 3,
                            },
                            },
                            {
                                breakpoint: 1500,
                                settings: {
                                    slidesToShow: isChatOpen?5:6,
                                },
                            },
                            {
                                breakpoint: 1400,
                                settings: {
                                    slidesToShow: isChatOpen?4:6,
                                },
                            },
                            {
                                breakpoint: 1200,
                                settings: {
                                    slidesToShow: 4,
                                },
                            },
                            {
                                breakpoint: 768,
                                settings: {
                                    slidesToShow: 2,
                                },
                            },
                        ]}
                        className="custom-carousel"
                    >
                    {
                        [1,2,3,4,5,6].map((game,index)=>(
                            <div className="ugItemOuter" key={index}>
                                <div className="ugItem" >
                                    <img src="/images/upcomingGameBing.png" alt="" />
                                    <span>COMING SOON</span>
                                </div> 
                            </div>
                        ))
                    }
            </Carousel>
            </div> */}
            <div className="todayEarningChart">
                <div className="tecTop">
                    <img src="/images/tecIcon.svg" alt="" />
                    <span>Today’s Earning Chart</span>
                </div>
                <div className="tecTopThree">
                    {
                        loading?.earningChart ?
                            <div style={{
                                height:100,
                                width:"100%",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center"
                            }}>
                                <Spin />
                            </div>
                        :
                        <>
                            <div className='ttItem'>
                                <div className="ttTop">
                                    <div className="ttIcon">
                                        <img src={BASE_URL+"/Images/"+topEarningTableData?.[1]?.gameImage}  alt="" />
                                    </div>
                                    <div className="ttCrownImg">
                                        <img src="/images/crown2.png" alt="" />
                                    </div>
                                </div>
                                <div className="ttBottom">
                                    <div className="tbName">
                                        <span>{topEarningTableData?.[1]?.name}</span>
                                    </div>
                                    <div className="tbPrice">
                                        <span>{topEarningTableData?.[1]?.amount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='ttItem ttItemFirst'>
                                <div className="ttTop">
                                    <div className="ttIcon">
                                        <img src={BASE_URL+"/Images/"+topEarningTableData?.[0]?.gameImage}  alt="" />
                                    </div>
                                    <div className="ttCrownImg">
                                        <img src="/images/crown1.png" alt="" />
                                    </div>
                                </div>
                                <div className="ttBottom">
                                    <div className="tbName">
                                        <span>{topEarningTableData?.[0]?.name}</span>
                                    </div>
                                    <div className="tbPrice">
                                        <span>{topEarningTableData?.[0]?.amount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='ttItem ttItemThird'>
                                <div className="ttTop">
                                    <div className="ttIcon">
                                        <img src={BASE_URL+"/Images/"+topEarningTableData?.[2]?.gameImage}  alt="" />
                                    </div>
                                    <div className="ttCrownImg">
                                        <img src="/images/crown3.png" alt="" />
                                    </div>
                                </div>
                                <div className="ttBottom">
                                    <div className="tbName">
                                        <span>{topEarningTableData?.[2]?.name}</span>
                                    </div>
                                    <div className="tbPrice">
                                        <span>{topEarningTableData?.[2]?.amount}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </div>
                {
                    topEarningTableData?.slice(3)?.length > 0 &&
                        <div className="tecTable">
                            <div className="tecHeader">
                                <div className="tehItem ranks">
                                    <img src="/images/trophyIcon.svg" alt="" width={16} />
                                    <span>Ranks</span>
                                </div>
                                <div className="tehItem user">
                                    <img src="/images/userfilledIcon.svg" alt="" width={15} />
                                    <span>User</span>
                                </div>
                                <div className="tehItem wallet">
                                    <img src="/images/wallettableIcon.svg" alt="" width={21} />
                                    <span>Total Win</span>
                                </div>
                            </div>
                            <div className="tecBody animate-rows">
                                {topEarningTableData?.slice(3)?.map((rowData, i) => (
                                    <div className="tecRowOuter troTop" key={i}>
                                        <div className="tecRow">
                                            <div className="tecTd count">{i+4}</div>
                                            <div className="tecTd user">
                                                <div className="tecUserData">
                                                    <div className="tudIcon">
                                                        <img src={BASE_URL+"/Images/"+rowData?.gameImage}  alt="" />
                                                    </div>
                                                    <div className="tudRight">
                                                        <p>{rowData?.name || "N/A"}</p>
                                                        <span>{rowData?.userName || ""}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="tecTd price">₹{isNaN(rowData?.amount) ? 0 : parseFloat(rowData.amount).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                }
            </div>
            <div className="liveWithdrwalHistory">
                <div className="tecTop">
                    <img src="/images/tecIcon.svg" alt="" />
                    <span>Live withdrwal History</span>
                </div>
                <div className="tecTable">
                    <div className="tecHeader">
                        <div className="tehItem user">
                            <img src="/images/userfilledIcon.svg" alt="" width={15} />
                            <span>User</span>
                        </div>
                        {/* <div className="tehItem game">
                            <img src="/images/consoleIcon.svg" alt="" width={16} />
                            <span>Game</span>
                        </div> */}
                        <div className="tehItem wallet">
                            <img src="/images/wallettableIcon.svg" alt="" width={21} />
                            <span className="desktopView">Recent Withdraw Amount</span>
                            <span className="mobileView">Amount</span>
                        </div>
                    </div>
                    <div className="tecBody">
                        {
                            loading?.liveWithdrawal ?
                                <div className="tecRow" style={{justifyContent:"center",background:"#26364B",padding:20}}>
                                    <div className="tecTd attendanceTitle game"style={{justifyContent:"center"}} >
                                        Loading...
                                    </div>
                                </div>
                            :
                                liveWithdrawalsData?.length>0 ?
                                    liveWithdrawalsData.map((rowData,i)=>(
                                        <div className="tecRowOuter" key={i}>
                                            <div className="tecRow">
                                                <div className="tecTd user">
                                                    <div className="tecUserData">
                                                        {/* <div className="tudIcon">
                                                            <img src="/images/tableUserDaaaa.png" alt="" />
                                                        </div> */}
                                                        <div className="tudRight">
                                                             {/* <p>Aarav Sharma</p> */}
                                                            <span style={{color:"#fff"}}>{rowData?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div className="tecTd game">
                                                    <img src={BASE_URL+"/Images/"+rowData?.gameImage} alt="" width={25} />
                                                    <span>Aviator</span>
                                                </div> */}
                                                <div className="tecTd price">
                                                    ₹{rowData?.amount}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            :
                                <div className="tecRow" style={{justifyContent:"center",background:"#26364B",padding:20}}>
                                    <div className="tecTd attendanceTitle game"style={{justifyContent:"center"}} >
                                        No data found!
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>


            {
                notificaitonModalVisible&&
                    <NotificationModal open={notificaitonModalVisible} setOpen={setNotificaitonModal}  />
            }
        </div>
    )
}
