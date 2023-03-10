import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import * as EgovNet from 'api/egovFetch';
import URL from 'constants/url';
import CODE from 'constants/code';

import { default as EgovLeftNav } from 'components/leftmenu/EgovLeftNavAdmin';

function EgovAdminScheduleList(props) {
    console.group("EgovAdminScheduleList");
    console.log("[Start] EgovAdminScheduleList ------------------------------");
    console.log("EgovAdminScheduleList [props] : ", props);
    
    const location = useLocation();
    console.log("EgovAdminScheduleList [location] : ", location);

    const DATE = new Date();
    const TODAY = new Date(DATE.getFullYear(), DATE.getMonth(), DATE.getDate());

    const [searchCondition, setSearchCondition] = useState(location.state?.searchCondition || { schdulSe: '', year: TODAY.getFullYear(), month: TODAY.getMonth(), date: TODAY.getDate() });
    const [calendarTag, setCalendarTag] = useState([]);

    const [scheduleList, setScheduleList] = useState([]);

    const innerConsole = (...args) => {
        console.log(...args);
    }

    const getLastDateOfMonth = (year, month) => {
        const LAST_DATE_SUPPLMENT = 1;
        return new Date(year, month + LAST_DATE_SUPPLMENT, 0);
    }
    const getFirstDateOfMonth = (year, month) => {
        return new Date(year, month, 1);
    }

    const changeDate = (target, amount) => {
        let changedDate;

        if (target === CODE.DATE_YEAR) {
            changedDate = new Date(searchCondition.year + amount, searchCondition.month, searchCondition.date);
        }

        if (target === CODE.DATE_MONTH) {
            changedDate = new Date(searchCondition.year, searchCondition.month + amount, searchCondition.date);
        }
        setSearchCondition({ ...searchCondition, year: changedDate.getFullYear(), month: changedDate.getMonth(), date: changedDate.getDate() });
    }

    const retrieveList = useCallback((srchcnd) => {
        console.groupCollapsed("EgovAdminScheduleList.retrieveList()");

        const retrieveListURL = '/cop/smt/sim/egovIndvdlSchdulManageMonthListAPI.do';
        const jToken = localStorage.getItem('jToken');
        const requestOptions = {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
                'Authorization': jToken
            },
            body: JSON.stringify(srchcnd)
        }

        EgovNet.requestFetch(retrieveListURL,
            requestOptions,
            (resp) => {
                setScheduleList(resp.result.resultList);
            },
            function (resp) {
                console.log("err response : ", resp);
            }
        );
        console.groupEnd("EgovAdminScheduleList.retrieveList()");
    },[]);

    const drawCalendar = () => {
        console.groupCollapsed("EgovAdminScheduleList.drawCalendar()");
        const PREV_MONTH_ADDITION = -1;

        let lastOfLastMonth = getLastDateOfMonth(searchCondition.year, searchCondition.month + PREV_MONTH_ADDITION);
        let firstOfThisMonth = getFirstDateOfMonth(searchCondition.year, searchCondition.month);
        let lastOfThisMonth = getLastDateOfMonth(searchCondition.year, searchCondition.month);

        console.log("lastOfLastMonth : ", lastOfLastMonth, lastOfLastMonth.getDay());
        console.log("firstOfThisMonth :", firstOfThisMonth, firstOfThisMonth.getDay());
        console.log("lastOfThisMonth :", lastOfThisMonth, lastOfThisMonth.getDay());
        console.log("scheduleList : ", scheduleList);

        let firstDayOfThisMonth = firstOfThisMonth.getDay();
        let lastDateOfThisMonth = lastOfThisMonth.getDate();
        console.log("firstDayOfThisMonth", firstDayOfThisMonth, "lastDateOfThisMonth", lastDateOfThisMonth)

        let monthArr = [];
        let weekArr = [];

        // firstWeek Date Set START
        let firstWeekDateCount = 0;
        for (let day = 0; day < 7; day++) {
            if (day < firstDayOfThisMonth) { // 
                weekArr.push(0);
                firstWeekDateCount = 0;
            } else {
                weekArr.push(++firstWeekDateCount);
            }
        }
        monthArr.push(weekArr);
        console.log("FirstWeek monthArr : ", monthArr);
        // firstWeek Date Set END

        // otherWeek Date Set START
        let dayCount = 0;
        weekArr = [];//?????????
        for (let day = firstWeekDateCount + 1; day <= lastDateOfThisMonth; day++) {

            if (dayCount % 7 !== 6) {
                weekArr.push(day);
            } else {
                weekArr.push(day);
                monthArr.push(weekArr);
                weekArr = [];
                dayCount = -1;
            }
            dayCount++;
        }
        // otherWeek Date Set END

        // lastWeek Date Set START
        if (weekArr.length > 0) {//?????? ??????
            for (let day = weekArr.length; day < 7; day++) {
                weekArr.push(0);
            }
            monthArr.push(weekArr);
        }
        // lastWeek Date Set END
        console.log("OtherWeek monthArr : ", monthArr);

        let mutsUseYearMonth = searchCondition.year.toString() + ((searchCondition.month + 1).toString().length === 1 ? "0" + (searchCondition.month + 1).toString() : (searchCondition.month + 1).toString());
        console.log("mutsUseYearMonth : ", mutsUseYearMonth);

        let mutCalendarTagList = [];
        let keyIdx = 0;
        
        //draw Calendar
        monthArr.forEach((week, weekIdx) => {
            console.log();
            mutCalendarTagList.push(
                <tr key={keyIdx++}>{
                    week.map((day, dayIdx) => {
                        if (day !== 0) {//?????? ?????? ??????
                            let sDate = day.toString().length === 1 ? "0" + day.toString() : day.toString();
                            let iUseDate = Number(mutsUseYearMonth + sDate);
                            if (scheduleList.length > 0) {//?????? ?????? ??????
                                return (
                                    <td key={keyIdx++}>
                                        <Link to={{pathname: URL.ADMIN_SCHEDULE_CREATE}} state={{iUseDate : mutsUseYearMonth + sDate + "000000"}} className="day" key={keyIdx++}>{day}</Link><br />
                                        {
                                            scheduleList.map((schedule, scheduleIdx) => {
                                                let iBeginDate = Number(schedule.schdulBgnde.substring(0, 8));
                                                let iEndDate = Number(schedule.schdulEndde.substring(0, 8));
                                                innerConsole("scheduleList ", day, scheduleIdx, iBeginDate, iUseDate, iEndDate, iUseDate >= iBeginDate && iUseDate <= iEndDate);
                                                innerConsole("schedule.schdulId ", schedule.schdulId);
                                                if (iUseDate >= iBeginDate && iUseDate <= iEndDate) {
                                                    return (
                                                        <>
                                                            <Link to={{pathname: URL.ADMIN_SCHEDULE_DETAIL}} 
                                                            state={{schdulId : schedule.schdulId}}
                                                            key={keyIdx++}>{schedule.schdulNm}
                                                            </Link>
                                                            <br />
                                                        </>
                                                    );
                                                } else return <></>
                                            })
                                        }
                                    </td>
                                );
                            } else {//?????? ?????? ??????
                                return (
                                    <td key={keyIdx++}>
                                        <Link to={{pathname: URL.ADMIN_SCHEDULE_CREATE}} state={{iUseDate : mutsUseYearMonth + sDate + "000000"}} className="day" key={keyIdx++}>{day}</Link><br />
                                    </td>);
                            }
                        } else if (day === 0) {// ?????????/????????? ??????
                            return (<td key={keyIdx++}></td>);
                        } else return <></>
                    })
                }</tr>);
        })
        console.log("mutCalendarTagList : ", mutCalendarTagList);
        setCalendarTag(mutCalendarTagList);
        console.groupEnd("EgovAdminScheduleList.drawCalendar()");
    }

	const Location = React.memo(function Location() {
        return (
            <div className="location">
                <ul>
                    <li><Link to={URL.MAIN} className="home">Home</Link></li>
                    <li><Link to={URL.ADMIN}>???????????????</Link></li>
                    <li>????????????</li>
                </ul>
            </div>
        )
    });

    useEffect(() => {
        retrieveList(searchCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchCondition]);

    useEffect(() => {
        drawCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleList]);

    console.log("------------------------------EgovAdminScheduleList [End]");
    console.groupEnd("EgovAdminScheduleList");
    return (
        <div className="container">
            <div className="c_wrap">
                {/* <!-- Location --> */}
                <Location />
                {/* <!--// Location --> */}

                <div className="layout">
                    {/* <!-- Navigation --> */}
                    <EgovLeftNav></EgovLeftNav>
                    {/* <!--// Navigation --> */}

                    <div className="contents NOTICE_LIST" id="contents">
                        {/* <!-- ?????? --> */}

                        <div className="top_tit">
                            <h1 className="tit_1">???????????????</h1>
                        </div>

                        <h2 className="tit_2">????????????</h2>

                        {/* <!-- ???????????? --> */}
                        <div className="condition">
                            <ul>
                                <li>
                                    <label className="f_select" htmlFor="sel1">
                                        <select name="schdulSe" id="sel1" title="??????"
                                            onChange={e => {
                                                setSearchCondition({ ...searchCondition, schdulSe: e.target.value });
                                            }}
                                        >
                                            <option value="">??????</option>
                                            <option value="1">??????</option>
                                            <option value="2">?????????</option>
                                            <option value="3">??????</option>
                                            <option value="4">??????</option>
                                            <option value="5">??????</option>
                                        </select>
                                    </label>
                                </li>
                                <li className="half L">
                                    <button className="prev"
                                        onClick={() => {
                                            changeDate(CODE.DATE_YEAR, -1);
                                        }}
                                    ></button>
                                    <span>{searchCondition.year}</span>
                                    <button className="next"
                                        onClick={() => {
                                            changeDate(CODE.DATE_YEAR, 1);
                                        }}
                                    ></button>
                                </li>
                                <li className="half R">
                                    <button className="prev"
                                        onClick={() => {
                                            changeDate(CODE.DATE_MONTH, -1);
                                        }}
                                    ></button>
                                    <span>{(searchCondition.month + 1)}</span>
                                    <button className="next"
                                        onClick={() => {
                                            changeDate(CODE.DATE_MONTH, 1);
                                        }}
                                    ></button>
                                </li>
                            </ul>
                        </div>
                        {/* <!--// ???????????? --> */}

                        <div className="calendar_list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>???</th>
                                        <th>???</th>
                                        <th>???</th>
                                        <th>???</th>
                                        <th>???</th>
                                        <th>???</th>
                                        <th>???</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calendarTag}
                                </tbody>
                            </table>
                        </div>
                        {/* <!--// ?????? --> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EgovAdminScheduleList;