import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import * as EgovNet from 'api/egovFetch';
import URL from 'constants/url';
import CODE from 'constants/code';

import { default as EgovLeftNav } from 'components/leftmenu/EgovLeftNavInform';

function EgovWeeklyList(props) {
    console.group("EgovWeeklyList");
    console.log("[Start] EgovWeeklyList ------------------------------");
    console.log("EgovWeeklyList [props] : ", props);

    const location = useLocation();
    console.log("EgovWeeklyList [location] : ", location);

    const DATE = new Date();
    const FIRST_DAY_OF_THIS_WEEK = new Date(DATE.getFullYear(), DATE.getMonth(), DATE.getDate() - DATE.getDay());

    const getWeekOfMonth = (date) => {
        let adjustedDate = date.getDate() + date.getDay();
        console.log("getWeekOfMonth : ", date, date.getDate(), date.getDay(), adjustedDate, adjustedDate / 7, 0 | adjustedDate / 7);
        let weeksOrder = [0, 1, 2, 3, 4, 5];
        let returnVal = parseInt(weeksOrder[0 | adjustedDate / 7]);
        console.log("returnVal:", returnVal);
        return (returnVal);
    }

    const [searchCondition, setSearchCondition] = useState(location.state?.searchCondition || { schdulSe: '', year: FIRST_DAY_OF_THIS_WEEK.getFullYear(), month: FIRST_DAY_OF_THIS_WEEK.getMonth(), date: FIRST_DAY_OF_THIS_WEEK.getDate(), weekDay: FIRST_DAY_OF_THIS_WEEK.getDay(), weekOfMonth: getWeekOfMonth(FIRST_DAY_OF_THIS_WEEK) });

    const [scheduleList, setScheduleList] = useState([]);
    const [listTag, setListTag] = useState([]);

    const changeDate = (target, amount) => {
        let changedDate;

        if (target === CODE.DATE_YEAR) {
            changedDate = new Date(searchCondition.year + amount, searchCondition.month, searchCondition.date);
        }

        if (target === CODE.DATE_MONTH) {
            changedDate = new Date(searchCondition.year, searchCondition.month + amount, searchCondition.date);
        }

        if (target === CODE.DATE_WEEK) {
            // let addtionOfDays = 7 * amount - searchCondition.weekDay;
            let addtionOfDays = 7 * amount;
            changedDate = new Date(searchCondition.year, searchCondition.month, searchCondition.date + addtionOfDays);//???????????? ??????
        }
        console.log("changedDate : ", changedDate);
        setSearchCondition({ ...searchCondition, year: changedDate.getFullYear(), month: changedDate.getMonth(), date: changedDate.getDate(), weekDay: changedDate.getDay(), weekOfMonth: getWeekOfMonth(changedDate) });
    }

    const drawList = useCallback(() => {
        const dayNames = ["?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????"];
        let mutListTag = [];
        
        let keyPropertyCnt = 0;
        // ????????? ?????? ??????
        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            let scheduleDate = new Date(searchCondition.year, searchCondition.month, searchCondition.date + dayIdx);
            let scheduleDateStr = scheduleDate.getFullYear() + "??? " + (scheduleDate.getMonth() + 1) + "??? " + scheduleDate.getDate() + "??? " + dayNames[scheduleDate.getDay()];
            let scheduleBgDate = scheduleDate.getFullYear() + (("00"+(scheduleDate.getMonth() + 1).toString()).slice(-2)) + (("00"+scheduleDate.getDate().toString()).slice(-2));

            keyPropertyCnt++;

            let mutSubListTag = [];
            let slicedScheduleList = [];

            //scheduleList??? ???????????? ????????? ????????? ????????? ?????????
            //scheduleList??? ??????????????? ????????? ?????? ????????? ?????????
            scheduleList.forEach((currentElement, index) => {
                // ???????????? ????????? ?????? ???????????? ????????? ????????????
                if((currentElement.schdulBgnde.substring(0,8) === currentElement.schdulEndde.substring(0,8))  &&  (currentElement.schdulBgnde.substring(0,8) === scheduleBgDate)) {
                    slicedScheduleList.push(scheduleList[index]);
                // ?????? ?????? ????????? ?????? ???????????? ???????????? ????????? ????????? (????????? ???????????? ???????????? ????????? ?????????)
                } else if((currentElement.schdulBgnde.substring(0,8) !== currentElement.schdulEndde.substring(0,8))  &&  (currentElement.schdulBgnde.substring(0,8) <= scheduleBgDate) && (currentElement.schdulEndde.substring(0,8) >= scheduleBgDate)) {
                    slicedScheduleList.push(scheduleList[index]);
                }
            })

            //???????????? ??? ?????????(???, ???????????? ????????? ?????????)
            if(slicedScheduleList.length === 0){
                mutListTag.push(
                    <div className="list_item" key={keyPropertyCnt}>
                        <div>{scheduleDateStr}</div>
                        <div>
                            <span>????????? ???????????? ????????????.</span>  
                        </div>
                    </div>
                )
            }

            else {
                mutListTag.push(
                    <div className="list_item" key={keyPropertyCnt}>
                            <div>{scheduleDateStr}</div>
                            <div>{mutSubListTag}</div>
                    </div>
                )

                let subKeyPropertyCnt =0;
                
                mutSubListTag.push(
                    <>
                        {slicedScheduleList.length !== 0 && slicedScheduleList.map((item) => {
                            subKeyPropertyCnt++;
                                return (
                                    <Link
                                        key={subKeyPropertyCnt}
                                        to={{pathname: URL.INFORM_WEEKLY_DETAIL}} 
                                        state={{
                                            schdulId: item.schdulId,
                                            prevPath: URL.INFORM_WEEKLY
                                        }}
                                        >
                                        <span>{getTimeForm(item.schdulBgnde)} ~ {getTimeForm(item.schdulEndde)}</span>
                                        <span>{item.schdulNm}</span>
                                        <span>{item.userNm}</span>
                                    </Link>
                                )
                        })}
                    </>
                )
            }   
        }
        setListTag(mutListTag);
    },[scheduleList, searchCondition.date, searchCondition.month, searchCondition.year]);

    const retrieveList = useCallback((srchcnd) => {
        console.groupCollapsed("EgovWeeklyList.retrieveList()");

        const retrieveListURL = '/cop/smt/sim/egovIndvdlSchdulManageWeekListAPI.do';
        const requestOptions = {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(srchcnd)
        }

        EgovNet.requestFetch(retrieveListURL,
            requestOptions,
            (resp) => {

                setScheduleList(resp.result.resultList);
                drawList();
            },
            function (resp) {
                console.log("err response : ", resp);
            }
        );

        console.groupEnd("EgovWeeklyList.retrieveList()");
    },[drawList]);

    const Location = React.memo(function Location() {
        return (
            <div className="location">
                <ul>
                    <li><Link to={URL.MAIN} className="home">Home</Link></li>
                    <li><Link to={URL.INFORM}>????????????</Link></li>
                    <li>????????? ??????</li>
                </ul>
            </div>
        )
    });

    const getTimeForm = (str) => {
        let hour = str.substring(8, 10);
        let starminute = str.substring(10, 12);
        return hour + ":" + starminute;
    }

    useEffect(() => {
        retrieveList(searchCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchCondition]);

    useEffect(() => {
        drawList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[scheduleList]);

    console.log("------------------------------EgovWeeklyList [End]");
    console.groupEnd("EgovWeeklyList");
    return (
        <div className="container">
            <div className="c_wrap">
                {/* <!-- Location --> */}
                <Location />
                {/* <!--// Location --> */}

                <div className="layout">
                    {/* <!-- Navigation --> */}
                    <EgovLeftNav />
                    {/* <!--// Navigation --> */}

                    <div className="contents WEEK_SCHEDULE" id="contents">
                        {/* <!-- ?????? --> */}

                        <div className="top_tit">
                            <h1 className="tit_1">????????????</h1>
                        </div>

                        <h2 className="tit_2">????????? ??????</h2>

                        {/* <!-- ???????????? --> */}
                        <div className="condition">
                            <ul>
                                <li>
                                    <label className="f_select" htmlFor="sel1">
                                        <select name="" id="sel1" title="??????"
                                            onChange={e => {
                                                setSearchCondition({ ...searchCondition, schdulSe: e.target.value });
                                            }}>
                                            <option value="">??????</option>
                                            <option value="1">??????</option>
                                            <option value="2">?????????</option>
                                            <option value="3">??????</option>
                                            <option value="4">??????</option>
                                            <option value="5">??????</option>
                                        </select>
                                    </label>
                                </li>
                                <li>
                                    <button className="prev"
                                        onClick={() => {
                                            changeDate(CODE.DATE_YEAR, -1);
                                        }}
                                    ></button>
                                    <span>{searchCondition.year}???</span>
                                    <button className="next"
                                        onClick={() => {
                                            changeDate(CODE.DATE_YEAR, 1);
                                        }}
                                    ></button>
                                </li>
                                <li className="half L">
                                    <button className="prev"
                                        onClick={() => {
                                            changeDate(CODE.DATE_MONTH, -1);
                                        }}
                                    ></button>
                                    <span>{(searchCondition.month + 1)}???</span>
                                    <button className="next"
                                        onClick={() => {
                                            changeDate(CODE.DATE_MONTH, 1);
                                        }}
                                    ></button>
                                </li>
                                <li className="half R">
                                    <button className="prev"
                                        onClick={() => {
                                            changeDate(CODE.DATE_WEEK, -1);
                                        }}
                                    ></button>
                                    <span>{searchCondition.weekOfMonth + 1}???</span>
                                    <button className="next"
                                        onClick={() => {
                                            changeDate(CODE.DATE_WEEK, 1);
                                        }}
                                    ></button>
                                </li>
                            </ul>
                        </div>
                        {/* <!--// ???????????? --> */}

                        {/* <!-- ??????????????? --> */}
                        <div className="board_list BRD003">
                            <div className="head">
                                <span>??????</span>
                                <span>??????</span>
                                <span>??????</span>
                                <span>?????????</span>
                            </div>
                            <div className="result">
                                {listTag}
                            </div>
                        </div>
                        {/* <!--// ??????????????? --> */}


                        {/* <!--// ?????? --> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EgovWeeklyList;