import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import * as EgovNet from 'api/egovFetch';
import URL from 'constants/url';
import CODE from 'constants/code';

import { default as EgovLeftNav } from 'components/leftmenu/EgovLeftNavAdmin';
import EgovAttachFile from 'components/EgovAttachFile';

function EgovAdminScheduleDetail(props) {
    console.group("EgovAdminScheduleDetail");
    console.log("[Start] EgovAdminScheduleDetail ------------------------------");
    console.log("EgovAdminScheduleDetail [props] : ", props);

    const navigate = useNavigate();
    const location = useLocation();
    console.log("EgovAdminScheduleDetail [location] : ", location);

    const [scheduleDetail, setScheduleDetail] = useState({});
    const [boardAttachFiles, setBoardAttachFiles] = useState();
    const [user, setUser] = useState({});

    const retrieveDetail = () => {

        const retrieveDetailURL = '/cop/smt/sim/egovIndvdlSchdulManageDetailAPI.do';
        const requestOptions = {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                schdulId: location.state?.schdulId
            })
        }
        EgovNet.requestFetch(retrieveDetailURL,
            requestOptions,
            function (resp) {
                let rawScheduleDetail = resp.result.scheduleDetail;
                rawScheduleDetail.startDateTime = convertDate(rawScheduleDetail.schdulBgnde);
                rawScheduleDetail.endDateTime = convertDate(rawScheduleDetail.schdulEndde);
                rawScheduleDetail.reptitSeCodeNm = getCodeName(resp.result.reptitSeCode, resp.result.scheduleDetail.reptitSeCode);
                rawScheduleDetail.schdulIpcrCodeNm = getCodeName(resp.result.schdulIpcrCode, resp.result.scheduleDetail.schdulIpcrCode);
                rawScheduleDetail.schdulSeNm = getCodeName(resp.result.schdulSe, resp.result.scheduleDetail.schdulSe);
                setScheduleDetail(rawScheduleDetail);
                setUser(resp.result.user);
                setBoardAttachFiles(resp.result.resultFiles);
            }
        );
    }
    const convertDate = (str) => {
        let year = str.substring(0, 4);
        let month = str.substring(4, 6);
        let date = str.substring(6, 8);
        let hour = str.substring(8, 10);
        let minute = str.substring(10, 12);
        return {
            year: year,
            month: month,
            date: date,
            hour: hour,
            minute: minute,
            dateForm: year + "??? " + month + "??? " + date + "??? " + hour + "??? " + minute + "??? "
        }
    }

    const getCodeName = (codeArr, code) => {
        return (
            codeArr.map((codeObj) => {
                if (codeObj.code === code.trim()) return codeObj.codeNm
                else return "";
            })
        );
    };

    const onClickDeleteSchedule = (schdulId) => {
        const deleteBoardURL = `/cop/smt/sim/egovIndvdlSchdulManageDeleteAPI/${schdulId}.do`;
        const jToken = localStorage.getItem('jToken');
        const requestOptions = {
            method: "DELETE",
            headers: {
                'Content-type': 'application/json',
                'Authorization': jToken
            },
            body: JSON.stringify({
                schdulId: schdulId
            })
        }

        EgovNet.requestFetch(deleteBoardURL,
            requestOptions,
            (resp) => {
                console.log("====>>> Schdule delete= ", resp);
                if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
                    alert("???????????? ?????????????????????.")
                    navigate(URL.ADMIN_SCHEDULE ,{ replace: true });
                } else {
                    // alert("ERR : " + resp.message);
                    navigate({pathname: URL.ERROR}, {state: {msg : resp.message}});
                }

            }
        );
    }

    useEffect(function () {
        retrieveDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    console.log("------------------------------EgovAdminScheduleDetail [End]");
    console.groupEnd("EgovAdminScheduleDetail");
    return (
        <div className="container">
            <div className="c_wrap">
                {/* <!-- Location --> */}
                <div className="location">
                    <ul>
                        <li><Link to={URL.MAIN} className="home">Home</Link></li>
                        <li><Link to={URL.ADMIN}>???????????????</Link></li>
                        <li>????????????</li>
                    </ul>
                </div>
                {/* <!--// Location --> */}

                <div className="layout">
                    {/* <!-- Navigation --> */}
                    <EgovLeftNav></EgovLeftNav>
                    {/* <!--// Navigation --> */}

                    <div className="contents SITE_GALLARY_VIEW" id="contents">
                        {/* <!-- ?????? --> */}

                        <div className="top_tit">
                            <h1 className="tit_1">???????????????</h1>
                        </div>

                        <h2 className="tit_2">???????????? ????????????</h2>

                        {/* <!-- ????????? ???????????? --> */}
                        <div className="board_view2">
                            <dl>
                                <dt>????????????</dt>
                                <dd>{scheduleDetail.schdulSeNm}</dd>
                            </dl>
                            <dl>
                                <dt>?????????</dt>
                                <dd>{scheduleDetail.schdulIpcrCodeNm}</dd>
                            </dl>
                            <dl>
                                <dt>??????</dt>
                                <dd>{scheduleDetail.schdulDeptName}</dd>
                            </dl>
                            <dl>
                                <dt>?????????</dt>
                                <dd>{scheduleDetail.schdulNm}</dd>
                            </dl>
                            <dl>
                                <dt>????????????</dt>
                                <dd>{scheduleDetail.schdulCn}</dd>
                            </dl>
                            <dl>
                                <dt>????????????</dt>
                                <dd>{scheduleDetail.reptitSeCodeNm}</dd>
                            </dl>
                            <dl>
                                <dt>??????/??????</dt>
                                <dd> {scheduleDetail.startDateTime?.dateForm} ~ {scheduleDetail.endDateTime?.dateForm}</dd>
                            </dl>
                            <dl>
                                <dt>?????????</dt>
                                <dd>{scheduleDetail.schdulChargerName}</dd>
                            </dl>

                            <EgovAttachFile boardFiles={boardAttachFiles} />

                            {/* <!-- ???????????? --> */}
                            <div className="board_btn_area">
                                {user.id &&
                                    <div className="left_col btn1">
                                        <Link to={{pathname: URL.ADMIN_SCHEDULE_MODIFY}}
                                            state={{
                                                schdulId: location.state?.schdulId
                                            }}
                                            className="btn btn_skyblue_h46 w_100">??????</Link>
                                        <button className="btn btn_skyblue_h46 w_100"
                                            onClick={(e) => {
                                                onClickDeleteSchedule(location.state?.schdulId);
                                            }}>??????</button>
                                        
                                    </div>
                                }
                                <div className="right_col btn1">
                                    <Link to={URL.ADMIN_SCHEDULE} className="btn btn_blue_h46 w_100">??????</Link>
                                </div>
                            </div>
                            {/* <!--// ???????????? --> */}
                        </div>
                        {/* <!-- ????????? ???????????? --> */}

                        {/* <!--// ?????? --> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EgovAdminScheduleDetail;