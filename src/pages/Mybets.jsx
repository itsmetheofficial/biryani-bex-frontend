import { Pagination, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { callGetAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const cookies = new Cookies();

export default function Mybets() {
    const navigate = useNavigate();
    const [filterData, setFilterData] = useState({
        gameType: "",
        status: "", // win | lose | all
        filter: "all", // all | today | yesterday | week | month
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [bets, setBets] = useState([]);
    const [totalBets, setTotalBets] = useState(0); // Total number of bets (items)
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const [loading, setLoading] = useState(false);

    // Fetch bets based on current filters and pagination
    const fetchBets = async () => {
        try {
            setLoading(true);
            const token = cookies.get("token");
            const userDetails = cookies.get("userDetails");
            const userId = userDetails?.userId || userDetails?._id;

            if (!token || !userId) {
                console.warn("No token/userDetails found");
                setBets([]);
                setTotalBets(0);
                return;
            }

            const params = {
                page: currentPage,
                limit: itemsPerPage,
                status: filterData.status || "",
                filter: filterData.filter || "all",
            };

            if (filterData.gameType) params.gameType = filterData.gameType;

            const res = await callGetAPI(
                API_ENDPOINTS.GET_USER_BETS(userId),
                token,
                params
            );

            if (res?.status) {
                let betsData = [];
                let totalData = 0;
                let pages = 0;

                if (Array.isArray(res?.data)) {
                    betsData = res?.data;
                    totalData = res?.totalBets || res?.data?.length || 0;
                    pages = res?.pagination?.totalPages || Math.ceil(totalData / itemsPerPage); // Calculate total pages
                } else if (res?.data?.bets) {
                    betsData = res?.data?.bets;
                    totalData = res?.data?.total || res?.data?.bets.length || 0;
                    pages =res?.pagination?.totalPages || Math.ceil(totalData / itemsPerPage); // Calculate total pages
                } else if (res?.bets) {
                    betsData = res?.bets;
                    totalData = res?.total || res?.bets?.length || 0;
                    pages =res?.pagination?.totalPages || Math.ceil(totalData / itemsPerPage); // Calculate total pages
                }

                setBets(betsData);
                setTotalBets(totalData);
                setTotalPages(pages); // Set the total pages
            } else {
                setBets([]);
                setTotalBets(0);
            }
        } catch (err) {
            console.error("Error fetching bets:", err);
            setBets([]);
            setTotalBets(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterData, currentPage]);

    const handleFilterChange = (key, value) => {
        setFilterData((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearAllFilters = () => {
        setFilterData({
            gameType: "",
            status: "",
            filter: "all",
        });
        setCurrentPage(1); // Reset to first page when filters are cleared
    };

    return (
        <div className="myBetsPage">
            <div className="pageHeader">
                <button onClick={()=>navigate(-1)} className="headerPrevButton">
                    <img src="/images/leftArrowFilled.svg" alt=""/>
                </button>
                <img src="/images/myBetsIcon.svg" alt="" width={40} />
                <span>Bet History</span>
            </div>

            {/* 🔹 Filters */}
            <div className="mbButtons">
                <div className="mbbLeft">
                    {/* Game Filter */}
                    <Select
                        value={filterData.gameType}
                        onChange={(val) => handleFilterChange("gameType", val)}
                        suffixIcon={
                            <img
                                src="/images/downfilledarroricon.svg"
                                alt="Arrow"
                                width={15}
                            />
                        }
                        className="custom-select"
                    >
                        <Option value="">Game: All</Option>
                        <Option value="Aviator">Aviator</Option>
                        <Option value="Ludo">Ludo</Option>
                        <Option value="mines">Mines</Option>
                        <Option value="winGo">WinGo</Option>
                        <Option value="fortuneWheels">Fortune Wheels</Option>
                    </Select>

                    {/* Win/Loss Filter */}
                    <button
                        className={filterData.status === "win" ? "active" : ""}
                        onClick={() =>
                            handleFilterChange(
                                "status",
                                filterData.status === "win" ? "" : "win"
                            )
                        }
                    >
                        Win Bets
                    </button>

                    <button
                        className={filterData.status === "lose" ? "active" : ""}
                        onClick={() =>
                            handleFilterChange(
                                "status",
                                filterData.status === "lose" ? "" : "lose"
                            )
                        }
                    >
                        Lost Bets
                    </button>
                </div>

                <div className="mbRight">
                    {/* Date Filter */}
                    <Select
                        value={filterData.filter}
                        onChange={(val) => handleFilterChange("filter", val)}
                        suffixIcon={
                            <img
                                src="/images/downfilledarroricon.svg"
                                alt="Arrow"
                                width={15}
                            />
                        }
                        className="custom-select"
                    >
                        <Option value="all">Date: All</Option>
                        <Option value="today">Today</Option>
                        <Option value="yesterday">Yesterday</Option>
                        <Option value="week">Last 7 Days</Option>
                        <Option value="month">Last 30 Days</Option>
                    </Select>

                    {(filterData.gameType || filterData.status !== "" || filterData.filter !== "all") && (
                        <button
                            className="dateButton"
                            onClick={clearAllFilters}
                            style={{ marginLeft: 8 }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* 🔹 Bets Table */}
            <div className="gsTable">
                <div className="tecTable">
                    <div className="tecHeader">
                        <div className="tehItem game">Game</div>
                        <div className="tehItem timeDate">Time/Date</div>
                        <div className="tehItem totalBets">Bet Amount</div>
                        <div className="tehItem winningAmount">Bet Results</div>
                    </div>
                    <div className="tecBody" style={{position:"relative"}}>
                        {
                            (loading && bets?.length>0) ?
                                <div className='loadingOverData'>
                                    <Spin size="large" tip="Loading" />
                                </div>
                                :null
                        }
                        {(loading && bets?.length===0) ? (
                            <div
                                style={{
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Spin />
                            </div>
                        ) : bets.length > 0 ? (
                            bets.map((bet,index) => (
                                <div className="tecRowOuter" key={bet?._id || index}>
                                    <div className="tecRow">
                                        <div className="tecTd game">
                                            <span>{bet?.gameType}</span>
                                        </div>
                                        <div className="tecTd game dateTime">
                                            <span>
                                                {bet?.betTime?.length>0 ? moment(bet?.betTime).format("DD/MM/YYYY | HH:mm A") : ""}
                                            </span>
                                        </div>
                                        <div className="tecTd price totalBets">
                                            <span>₹{bet?.playAmount || 0}</span>
                                        </div>
                                        <div
                                            className={`tecTd winningAmount ${bet?.gameStatus === "win"
                                                    ? "Success"
                                                    : bet?.gameStatus === "lose"
                                                        ? "Failed"
                                                        : "Pending"
                                                }`}
                                        >
                                            <span className="tecTdTag">
                                                {bet?.gameStatus === "win"
                                                    ? `Won: ₹${bet?.winAmount || 0}`
                                                    : bet?.gameStatus === "lose"
                                                        ? "Lost"
                                                        : "Pending"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    padding: 20,
                                    color: "#fff",
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                No data found!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Pagination */}
            <div className="gsPagination">
                <Pagination
                    current={currentPage}
                    pageSize={itemsPerPage}
                    total={totalBets}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    hideOnSinglePage={false}
                    disabled={loading} // Disable pagination during loading
                    itemRender={(current, type, originalElement) => {
                        if (type === "prev") {
                            return (
                                <a
                                    style={{
                                        pointerEvents: currentPage === 1 ? "none" : "auto",
                                        color: currentPage === 1 ? "#ccc" : "initial",
                                    }}
                                >
                                    Previous
                                </a>
                            );
                        }
                        if (type === "next") {
                            return (
                                <a
                                    style={{
                                        pointerEvents: currentPage === totalPages ? "none" : "auto",
                                        color: currentPage === totalPages ? "#ccc" : "initial",
                                    }}
                                >
                                    Next
                                </a>
                            );
                        }
                        if (type === "page") {
                            return <a>{current}</a>;
                        }
                        return originalElement;
                    }}
                />
            </div>
        </div>
    );
}
