import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as EgovNet from 'api/egovFetch';

import URL from 'constants/url';
import CODE from 'constants/code';

function EgovLoginContent(props) {
    console.group("EgovLoginContent");
    console.log("[Start] EgovLoginContent ------------------------------");
    console.log("EgovLoginContent [props] : ", props);

    const navigate = useNavigate();
    const location = useLocation();
    console.log("EgovLoginContent [location] : ", location);

    const [userInfo, setUserInfo] = useState({ id: '', password: 'default', userSe: 'USR' });
	// eslint-disable-next-line no-unused-vars
    const [loginVO, setLoginVO] = useState({});

    const [saveIDFlag, setSaveIDFlag] = useState(false);

    const checkRef = useRef();

    const KEY_ID = "KEY_ID";
    const KEY_SAVE_ID_FLAG = "KEY_SAVE_ID_FLAG";

    const handleSaveIDFlag = () => {
        localStorage.setItem(KEY_SAVE_ID_FLAG, !saveIDFlag);
        setSaveIDFlag(!saveIDFlag);
    };

    let idFlag;
        try {
            idFlag = JSON.parse(localStorage.getItem(KEY_SAVE_ID_FLAG));
        }
        catch(err) {
            idFlag = null;
        } 

    useEffect(() => {

        if (idFlag === null) {
            setSaveIDFlag(false);
			// eslint-disable-next-line react-hooks/exhaustive-deps
            idFlag = false;
        }
        if (idFlag !== null) setSaveIDFlag(idFlag);
        if (idFlag === false) {
            localStorage.setItem(KEY_ID, "");
            checkRef.current.className = "f_chk"
        } else {
            checkRef.current.className = "f_chk on"
        };
      
        let data = localStorage.getItem(KEY_ID);
        if (data !== null) setUserInfo({ ...userInfo, id: data });
      }, [idFlag]);

    const submitFormHandler = (e) => {
        console.log("EgovLoginContent submitFormHandler()");
        
        //const loginUrl = "/uat/uia/actionLoginAPI.do"
        const loginUrl = "/uat/uia/actionLoginJWT.do"
        const requestOptions = {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        }

        EgovNet.requestFetch(loginUrl,
            requestOptions,
            (resp) => {
                let resultVO = resp.resultVO;
                let jToken = resp?.jToken

                localStorage.setItem('jToken', jToken);

                if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
                    setLoginVO(resultVO);
                    sessionStorage.setItem('loginUser', JSON.stringify(resultVO));
                    props.onChangeLogin(resultVO);
                    if (saveIDFlag) localStorage.setItem(KEY_ID, resultVO?.id);
                    navigate(URL.MAIN);
                } else {
                    alert(resp.resultMessage)
                }
            })
    }

    console.log("------------------------------EgovLoginContent [End]");
    console.groupEnd("EgovLoginContent");
    
    return (
        <div className="contents" id="contents">
            {/* <!-- ?????? --> */}
            <div className="Plogin">
                <h1>?????????</h1>
                <p className="txt">????????????????????????????????? ???????????? ???????????? ????????? ??????????????????.<br />???????????? ????????? ?????? ???????????? ???????????? ???????????? ??? ????????????.</p>

                <div className="login_box">
                    <form name="" method="" action="" >
                        <fieldset>
                            <legend>?????????</legend>
                            <span className="group">
                                <input type="text" name="" title="?????????" placeholder="?????????" value={userInfo?.id}
                                    onChange={e => setUserInfo({ ...userInfo, id: e.target.value })} />
                                <input type="password" name="" title="????????????" placeholder="????????????"
                                    onChange={e => setUserInfo({ ...userInfo, password: e.target.value })} />
                            </span>
                            <div className="chk">
                                <label className="f_chk" htmlFor="saveid" ref={checkRef}>
                                    <input type="checkbox" name="" id="saveid" onChange={handleSaveIDFlag} checked={saveIDFlag}/> <em>ID??????</em>
                                </label>
                            </div>
                            <button type="button" onClick={submitFormHandler}><span>LOGIN</span></button>
                        </fieldset>
                    </form>
                </div>

                <ul className="list">
                    <li>??????????????? 6~12?????? ?????? ???/?????????, ??????, ??????????????? ???????????? ???????????? ??? ????????????.</li>
                    <li>?????? ??????????????? ?????? ?????? ???????????? ??????????????? ?????? ??????, ???????????? ???????????? ???????????????
                        ??????????????? ???????????? ?????? ????????????.</li>
                </ul>
            </div>
            {/* <!--// ?????? --> */}
        </div>
    );
}

export default EgovLoginContent;