import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, CloseOutlined, ExclamationOutlined, GifOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DatePicker, Pagination, Select, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import VeiwDetailsModal from "../components/VeiwDetailsModal";
import { callGetAPI } from "../api/apiHelper";
import { API_ENDPOINTS } from "../api/apiConfig";
import { useCookies } from "react-cookie";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function AllTransactions() {
    const navigate = useNavigate();
    const [cookies] = useCookies(["token"]);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterData, setFilterData] = useState({
        type: "all",
        status: "all",
        from: "all",
        to: "all"
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // Modal state
    const [depositDetialsModalVisible, setdepositDetialsModalVisible] =
        useState(false);
    const [selectedDepoiteEntry, setselectedDepoiteEntry] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, [filterData, currentPage]);


    const fetchTransactions = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);

            if (filterData?.type !== "all") params.append("transactionType", filterData?.type);
            if (filterData?.status !== "all") params.append("status", filterData?.status);
            if (filterData?.from !== "all") params.append("fromDate", moment(filterData?.from).format('YYYY-MM-DD'));
            if (filterData?.to !== "all") params.append("toDate", moment(filterData?.to).format('YYYY-MM-DD'));

            const url = `${API_ENDPOINTS.GET_ALL_TRANSACTIONS}?${params.toString()}`;

            const response = await callGetAPI(url, cookies.token);

            if (response?.success) {
                setTransactions(response?.transactions || []);
                setTotal(response?.totalRecords || 0);
            } else {
                // setTransactions([]);
                setTotal(0);
                message.error(response?.message || "Failed to fetch transactions");
            }
        } catch (error) {
            console.error("Fetch Transactions Error:", error);
            message.error("Something went wrong while fetching transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date, fieldName) => {
        setFilterData((prev) => ({
            ...prev,
            [fieldName]: date
        }))
    };

    return (
        <div className="alltransactionPage">
            <div className="pageHeader">
                <button onClick={()=>navigate(-1)} className="headerPrevButton">
                    <img src="/images/leftArrowFilled.svg" alt=""/>
                </button>
                <span>All Transactions</span>
            </div>

            {/* Filters */}
            <div className="mbButtons">
                <div className="mbbLeft">
                    <Select
                        value={filterData?.type}
                        onChange={(value) => setFilterData((prev) => ({ ...prev, type: value }))}
                        suffixIcon={
                            <img
                                src="/images/downfilledarroricon.svg"
                                alt="Arrow"
                                width={15}
                            />
                        }
                        className="custom-select selectItemWithIcon"
                    >
                        <Option value="all">
                            <img src="/images/addBankIcon.svg" alt="" width={15} /> Type
                        </Option>
                        <Option value="Deposit">
                            <ArrowUpOutlined /> Deposit
                        </Option>
                        <Option value="Withdraw">
                            <ArrowDownOutlined /> Withdraw
                        </Option>
                        <Option value="Bonus">
                            <PlusOutlined /> Bonus
                        </Option>
                        <Option value="Failed">
                            <CloseOutlined /> Failed
                        </Option>
                    </Select>

                    <Select
                        value={filterData?.status}
                        onChange={(value) => setFilterData((prev) => ({ ...prev, status: value }))}
                        suffixIcon={
                            <img
                                src="/images/downfilledarroricon.svg"
                                alt="Arrow"
                                width={15}
                            />
                        }
                        className="custom-select selectItemWithIcon"
                    >
                        <Option value="all">
                            <img src="/images/statusIcon.svg" alt="" width={15} /> Status
                        </Option>
                        <Option value="Success">
                            <CheckOutlined /> Success
                        </Option>
                        <Option value="Pending">
                            <ExclamationOutlined /> Pending
                        </Option>
                        <Option value="Failed">
                            <CloseOutlined /> Failed
                        </Option>
                    </Select>
                </div>

                <div className="mbRight">
                    <DatePicker
                        onChange={(e) => handleDateChange(e, "from")}
                        allowClear
                        format="YYYY-MM-DD"
                        className="custom-datepicker"
                        dropdownClassName="custom-datepicker-dropdown"
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                        inputReadOnly
                    />
                    <button
                        className="dateButton"
                        onClick={() => document.querySelector('.custom-datepicker input')?.click()}
                    >
                        {filterData?.from !== 'all' ? `From: ${new Date(filterData?.from).toLocaleDateString('en-GB')}` : 'From: All'}
                    </button>
                    <DatePicker
                        onChange={(e) => handleDateChange(e, "to")}
                        allowClear
                        format="YYYY-MM-DD"
                        className="custom-datepicker-2"
                        dropdownClassName="custom-datepicker-dropdown"
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                        inputReadOnly
                    />
                    <button
                        className="dateButton"
                        onClick={() => document.querySelector('.custom-datepicker-2 input')?.click()}
                    >
                        {filterData?.to !== 'all' ? `To: ${new Date(filterData?.to).toLocaleDateString('en-GB')}` : 'To: All'}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="mwTable">
                <div className="gsTable">
                    <div className="tecTable">
                        <div className="tecHeader">
                            <div className="tehItem type">
                                <img src="/images/addBankIcon.svg" alt="" width={18} />
                                <span>Type</span>
                            </div>
                            {/* <div className="tehItem orderId">
                                <img src="/images/orderIdIcon.svg" alt="" width={20} />
                                <span>Order ID</span>
                            </div> */}
                            <div className="tehItem timeDate">
                                <img src="/images/timeDateIcon.svg" alt="" width={20} />
                                <span>Time/Date</span>
                            </div>
                            <div className="tehItem dipositeWithdrwal">
                                <img src="/images/depositWithrwalIcon.svg" alt="" width={26} />
                                <span>
                                    Deposit/<br />Withdraw
                                </span>
                            </div>
                            <div className="tehItem balance">
                                <img src="/images/depositIIcon.svg" alt="" width={24} />
                                <span>Balance</span>
                            </div>
                            <div className="tehItem status">
                                <img src="/images/statusIcon.svg" alt="" width={20} />
                                <span>Status</span>
                            </div>
                        </div>

                        {console.log("transactions : ",transactions)}

                        <div className="tecBody" style={{position:"relative"}}>
                            {
                                (loading && transactions?.length>0) ?
                                    <div className='loadingOverData'>
                                        <Spin size="large" tip="Loading" />
                                    </div>
                                    :null
                            }
                            {(loading && transactions?.length===0) ? (
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
                            ) : transactions.length > 0 ? (
                                transactions.map((row) => (
                                    <div key={row?._id} className="tecRowOuter">
                                        <div className="tecRow">
                                            <div className="tecTd type">
                                                <span className="tag">{row?.paymentMode}</span>
                                                <span className="paymentType">{row?.transactionType}</span>
                                            </div>
                                            {/* <div className="tecTd orderId">
                                                <span>{row?.transactionId || "N/A"}</span>
                                            </div> */}
                                            <div className="tecTd dateTime" >
                                                <span>{moment(row?.createdAt).format("YYYY-MM-DD HH:mm")}</span><br />
                                            </div>
                                            <div
                                                className={`tecTd depositWithdrwal ${row?.amount < 0 ? "negativeBalance" : ""
                                                    }`}
                                            >
                                                <span>{row?.transactionType === "Withdraw" ? "-" : "+"}{row?.amount}</span>
                                            </div>
                                            <div className="tecTd balance">
                                                <span>{isNaN(row?.remainingBalance) ? 0 : row?.remainingBalance.toFixed(2)}</span>
                                            </div>
                                            <div className={`tecTd status ${row?.status}`}>
                                                <span className="tecTdTag">{row?.status}</span>
                                                <button
                                                    onClick={() => {
                                                        setdepositDetialsModalVisible(true);
                                                        setselectedDepoiteEntry(row);
                                                    }}
                                                >
                                                    <img src="/images/eyeButtonIcon.svg" alt="" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={
                                    {
                                        padding: 20,
                                        textAlign: "center",
                                        color: "#fff",
                                    }
                                }>
                                    No data found!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="gsPagination">
                <Pagination
                    current={currentPage}
                    pageSize={itemsPerPage}
                    total={total}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    hideOnSinglePage={false}
                    itemRender={(current, type, originalElement) => {
                        if (type === "prev") return <a>Previous</a>;
                        if (type === "next") return <a>Next</a>;
                        if (type === "page") return <a>{current}</a>;
                        return originalElement;
                    }}
                    showLessItems={window.innerWidth<768}
                />
            </div>

            {depositDetialsModalVisible && (
                <VeiwDetailsModal
                    open={depositDetialsModalVisible}
                    closeModal={() => {
                        setdepositDetialsModalVisible(false);
                        setselectedDepoiteEntry(null);
                    }}
                    record={selectedDepoiteEntry}
                />
            )}
        </div>
    );
}
