import { SearchOutlined } from '@ant-design/icons';
import { Select, DatePicker, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { callGetAPI } from '../api/apiHelper';
import { API_ENDPOINTS } from '../api/apiConfig';
import { useCookies } from 'react-cookie';

const { Option } = Select;

export default function SubordinateData() {
    const navigate = useNavigate();
    const [cookies] = useCookies();
    const [loading, setLoading] = useState({ tableData: false, dashboardData: false });
    const [subordinates, setSubordinates] = useState([]);
    const [dashbordData, setDashboardData] = useState({});
    const [filters, setFilters] = useState({
        // searchUID: '',
        level: 'All',
        dateFilter: 'All',
        selectedDate: null,
    });

    const userId = cookies?.userDetails?.userId;
    const token = cookies?.token;

    useEffect(()=>{
        fetchRefferalDashboard();
    },[])

    useEffect(() => {
        fetchSubordinates();
    }, [filters]);

    const fetchSubordinates = async () => {
        try {
            setLoading((prev) => ({ ...prev, tableData: true }));
            const query = { level: filters.level !== 'All' ? filters.level : 'All' };

            if (filters.selectedDate) {
                query.date = moment(filters.selectedDate).format('YYYY-MM-DD');
            } else if (filters.dateFilter !== 'All') {
                query.date = filters.dateFilter;
            }

            const response = await callGetAPI(API_ENDPOINTS.GET_REFERRAL_STATS_NEW(userId), token, query);
            if (response.success) {
                setSubordinates(response.data || []);
            } else {
                message.error(response.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error(err);
            message.error('Something went wrong');
        } finally {
            setLoading((prev) => ({ ...prev, tableData: false }));
        }
    };
    const fetchRefferalDashboard = async () => {
        setLoading((prev) => ({ ...prev, dashboardData: true }));
        const res = await callGetAPI(API_ENDPOINTS.GET_REFERRAL_DASHBOARD(userId), token);
        if (res?.success) {
            setDashboardData(res?.data);
        } else {
            setDashboardData({})
            console.error(res?.message);
        }
        setLoading((prev) => ({ ...prev, dashboardData: false }));
    }

    const clearFilters = () => {
        setFilters({ searchUID: '', level: 'All', dateFilter: 'All', selectedDate: null });
    };

    
    // const filteredData = subordinates.filter(item =>
    //     item.uid?.includes(filters.searchUID)
    // );
    const filteredData = subordinates
    return (
        <div className="aboutUsPage privacyPolicyPage subordinateDataPage">
            <div className="auHeaderOuter">
                <div className="auHeader">
                    <span>Subordinate Data</span>
                   <button onClick={() => navigate('/promotions')}>
                        <img src="/images/closeModalIcon.png" alt="" />
                    </button>
                </div>
            </div>

            <div className="pptMid" style={{ position: "relative" }}>
                {
                    loading?.dashboardData ?
                        <div className='loadingOverData'>
                            <Spin size="large" tip="Loading" />
                        </div>
                        : null
                }
                <div className="pptMidInner">
                    <div className="ptmItem">
                        <div className="pmIContent">
                            <div className="pmcItem"><span>{dashbordData?.directSubordinates?.depositUsers ||0}</span><p>Deposit number</p></div>
                            <div className="pmcItem green"><span>{dashbordData?.directSubordinates?.depositUsers ||0}</span><p>Number of bettors</p></div>
                            <div className="pmcItem"><span>{dashbordData?.directSubordinates?.firstDepositUsers ||0}</span><p>First deposits</p></div>
                        </div>
                    </div>
                    <div className="ptmItem">
                        <div className="pmIContent">
                            <div className="pmcItem"><span>₹{dashbordData?.directSubordinates?.depositAmount ||0}</span><p>Deposit amount</p></div>
                            <div className="pmcItem green"><span>₹
                                {
                                    (dashbordData?.directSubordinates?.depositAmount ||0) *
                                    (dashbordData?.directSubordinates?.depositUsers ||0)
                                }
                                </span><p>Total bet</p></div>
                            <div className="pmcItem">
                                <span>₹
                                    {
                                    (dashbordData?.directSubordinates?.depositAmount ||0) *
                                    (dashbordData?.directSubordinates?.firstDepositUsers ||0)
                                    }
                                    </span><p>First deposit amount</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="gsButtonsOuter sdButton">
                <div className="gsButtons">
                    {/* <div className="searchButtonsec">
                        <input
                            type="text"
                            placeholder="Search Subordinate UID"
                            value={filters.searchUID}
                            onChange={e => setFilters({ ...filters, searchUID: e.target.value })}
                        />
                        <button><SearchOutlined style={{ fontSize: 23 }} /></button>
                    </div> */}

                    <Select
                        value={filters.level}
                        onChange={value => setFilters({ ...filters, level: value })}
                        suffixIcon={<img src="/images/downfilledarroricon.svg" alt="Arrow" width={15} />}
                        className="custom-select"
                    >
                        <Option value="All">Level : All</Option>
                        <Option value="1">Level 1</Option>
                        <Option value="2">Level 2</Option>
                        <Option value="3">Level 3</Option>
                    </Select>

                    <div className="mbButtons" style={{ gap: 20 }}>
                        <DatePicker
                            onChange={date => setFilters({ ...filters, selectedDate: date, dateFilter: 'All' })}
                            value={filters.selectedDate}
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
                            {filters.selectedDate
                                ? `Date: ${new Date(filters.selectedDate).toLocaleDateString('en-GB')}`
                                : 'Date: All'}
                        </button>
                        {(filters.searchUID || filters.level !== 'All' || filters.dateFilter !== 'All' || filters.selectedDate) && (
                            <button className="clearBtn" onClick={clearFilters}>Clear Filters</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mwTable">
                <div className="gsTable">
                    <div className="tecTable">
                        <div className="tecHeader">
                            <div className="tehItem level"><img src="/images/trophyIcon.svg" alt="" width={16} /><span>Level</span></div>
                            <div className="tehItem orderId"><img src="/images/tagicon.png" alt="" width={20} /><span>UID</span></div>
                            <div className="tehItem timeDate"><img src="/images/timeDateIcon.svg" alt="" width={20} /><span>Time/Date</span></div>
                            <div className="tehItem dipositeWithdrwal"><img src="/images/depositIIcon.svg" alt="" width={26} /><span>Deposit Amount</span></div>
                            <div className="tehItem balance commission"><img src="/images/wallettableIcon.svg" alt="" width={21} /><span>Commission</span></div>
                        </div>
                        <div className="tecBody">
                            {loading?.tableData ? (
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
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <div className="tecRowOuter" key={index}>
                                        <div className="tecRow">
                                            <div className="tecTd level">
                                                <span style={{ marginRight: 10 }}>{row?.level}</span>
                                                {/* <div className="tudIcon">
                                                    <img src="/images/tableUserDaaaa.png" alt="" />
                                                </div> */}
                                            </div>
                                            <div className="tecTd orderId"><span>{row?.userId}</span></div>
                                            <div className="tecTd game dateTime"><span>{row?.date ? row?.date+" | " :""}  {row?.time}</span></div>
                                            <div className="tecTd depositWithdrwal"><span>₹{row?.depositAmount}</span></div>
                                            <div className="tecTd balance commission"><span>₹{row?.commission}</span></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>No data found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
