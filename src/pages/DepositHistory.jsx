import { CheckOutlined, CloseOutlined, ExceptionOutlined, ExclamationOutlined, SearchOutlined } from '@ant-design/icons';
import { DatePicker, message, Pagination, Select, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import VeiwDetailsModal from '../components/VeiwDetailsModal';
import moment from 'moment';
import { useCookies } from 'react-cookie';
import { callGetAPI } from '../api/apiHelper';
import { API_ENDPOINTS } from '../api/apiConfig';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function DepositHistory() {
    const navigate = useNavigate();
    const [cookies] = useCookies();
    const [depositDetialsModalVisible, setDepositDetialsModalVisible] = useState(false);
    const [selectedDepositEntry, setselectedDepositEntry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [transactions, setTransactions] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 10;

    const [filterData, setFilterData] = useState({
        transactionType: 'Deposit',
        paymentMode: '',
        status: '',
        fromDate: null,
        toDate: null,
    });

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [filterData]);

    const fetchTransactions = async (page = 1) => {
        setLoading(true);

        const queryParams = {
            transactionType: filterData.transactionType,
            paymentMode: filterData.paymentMode,
            status: filterData.status,
            fromDate: filterData.fromDate ? moment(filterData.fromDate).format('YYYY-MM-DD') : '',
            toDate: filterData.toDate ? moment(filterData.toDate).format('YYYY-MM-DD') : '',
            page,
            limit: itemsPerPage,
            userId:cookies?.userDetails?.userId
        };

        try {
            const response = await callGetAPI(
                API_ENDPOINTS.GET_ALL_TRANSACTIONS,
                cookies.token,
                queryParams,
            );

            if (response?.success) {
                setTransactions(response.transactions || []);
                setTotalRecords(response.totalRecords || 0);
                setTotalPages(response.totalPages || 1);
                setCurrentPage(response.currentPage || 1);
            } else {
                message.error(response?.message || 'Failed to fetch transactions');
                setTransactions([]);
            }
        } catch (error) {
            message.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchTransactions(page);
    };

    const debouncedFilterChange = (key, value) => {
        setFilterData((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1);
    };

    const handleDateChange = (date,key) => {
        setFilterData((prev) => ({
            ...prev,
            [key]: date,
        }));
    };

    const clearAllFilters = () => {
        setFilterData({
            // transactionType: 'Deposit',
            transactionType: 'Deposit',
            paymentMode: '',
            status: '',
            fromDate: null,
            toDate: null,
        });
        setCurrentPage(1);
        fetchTransactions(1);
    };

    return (
        <div className="alltransactionPage depositHistory">
            <div className="pageHeader">
                <button onClick={()=>navigate(-1)} className="headerPrevButton">
                    <img src="/images/leftArrowFilled.svg" alt=""/>
                </button>
                <span>Deposit History</span>
            </div>

            {/* Filter Section */}
            <div className="mbButtons">
                <div className="mbbLeft">
                    <Select
                        value={filterData.status}
                        onChange={(val) => debouncedFilterChange('status', val)}
                        suffixIcon={<img src="/images/downfilledarroricon.svg" alt="Arrow" width={15} />}
                        className="custom-select"
                    >
                        <Option value="">
                            <img src="/images/statusIcon.svg" alt="" width={15} style={{ marginRight: 8 }} /> Status
                        </Option>
                        <Option value="Success"><CheckOutlined style={{ marginRight: 8 }} /> Success</Option>
                        <Option value="Pending"><ExclamationOutlined style={{ marginRight: 8 }} /> Pending</Option>
                        <Option value="Failed"><CloseOutlined style={{ marginRight: 8 }} /> Failed</Option>
                    </Select>
                </div>

                <div className="mbRight">
                    <Select
                        value={filterData.paymentMode}
                        onChange={(val) => debouncedFilterChange('paymentMode', val)}
                        suffixIcon={<img src="/images/downfilledarroricon.svg" alt="Arrow" width={15} />}
                        className="custom-select"
                    >
                        <Option value="">All Payment Type</Option>
                        <Option value="Bank">Bank</Option>
                        <Option value="USDT">USDT</Option>
                        <Option value="UPI">UPI</Option>
                        <Option value="Bonus">Bonus</Option>
                        <Option value="Admin">Admin</Option>
                    </Select>

                    <DatePicker
                        onChange={(date) => handleDateChange(date, 'fromDate')}
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
                        {filterData?.fromDate
                            ? `Date: ${new Date(filterData.fromDate).toLocaleDateString('en-GB')}`
                            : 'Date: All'}
                    </button>

                    {filterData.fromDate && (
                        <button className="dateButton" onClick={clearAllFilters} style={{ marginLeft: 8 }}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="mwTable">
                <div className="gsTable">
                    <div className="tecTable">
                        <div className="tecHeader">
                            <div className="tehItem type"><img src="/images/addBankIcon.svg" alt="" width={18} /><span>Type</span></div>
                            <div className="tehItem orderId"><img src="/images/orderIdIcon.svg" alt="" width={20} /><span>Order ID</span></div>
                            <div className="tehItem timeDate"><img src="/images/timeDateIcon.svg" alt="" width={20} /><span>Time/Date</span></div>
                            <div className="tehItem dipositeWithdrwal"><img src="/images/depositWithrwalIcon.svg" alt="" width={26} /><span>Deposit</span></div>
                            <div className="tehItem balance"><img src="/images/depositIIcon.svg" alt="" width={24} /><span>Balance</span></div>
                            <div className="tehItem status"><img src="/images/statusIcon.svg" alt="" width={20} /><span>Status</span></div>
                        </div>

                        <div className="tecBody">

                            {
                                loading ?
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
                                :
                                transactions?.length ?

                                    transactions.map((row, index) => (
                                        <div className="tecRowOuter" key={index}>
                                            <div className="tecRow">
                                                <div className="tecTd type"><span>{row?.paymentMode || 'N/A'}</span></div>
                                                <div className="tecTd orderId"><span>{row?.transactionId || 'N/A'}</span></div>
                                                <div className="tecTd game dateTime"><span>{row?.createdAt ? moment(row?.createdAt).format('lll') : 'N/A'}</span></div>
                                                <div className="tecTd price depositWithdrwal"><span>{row?.amount || 0}</span></div>
                                                <div className="tecTd balance"><span>{row?.remainingBalance || 0}</span></div>
                                                <div className={`tecTd status ${row?.status}`}>
                                                    <span className="tecTdTag">{row?.status}</span>
                                                    <button onClick={() => {
                                                        setselectedDepositEntry(row);
                                                        setDepositDetialsModalVisible(true);
                                                    }}>
                                                        <img src="/images/eyeButtonIcon.svg" alt="" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                :
                                    <div style={
                                        { 
                                            padding: 20,
                                            textAlign: "center",
                                            color:"#fff",
                                        }
                                    }>
                                        No data found!
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="gsPagination">
                <Pagination
                    current={currentPage}
                    pageSize={itemsPerPage}
                    total={totalRecords}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    hideOnSinglePage={false}
                    itemRender={(current, type, originalElement) => {
                        if (type === 'prev') {
                            return (
                                <a disabled={currentPage === 1}>Previous</a>
                            );
                        }
                        if (type === 'next') {
                            return (
                                <a disabled={currentPage === totalPages}>Next</a>
                            );
                        }
                        return originalElement;
                    }}
                />
            </div>

            {/* Modal */}
            {depositDetialsModalVisible && (
                <VeiwDetailsModal
                    open={depositDetialsModalVisible}
                    closeModal={() => {
                        setDepositDetialsModalVisible(false);
                        setselectedDepositEntry(null);
                    }}
                    record={selectedDepositEntry}
                />
            )}
        </div>
    );
}
