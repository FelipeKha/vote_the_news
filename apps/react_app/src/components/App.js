import React, { useState, useEffect } from "react";

import NavAppBar from "./NavAppBar";
import NewArticlePostUrlInput from "./NewArticlePostUrlInput";
import MainGrid from "./MainGrid";

import os from 'os';

function App() {
    // console.log("App rendered");
    const [pageDisplayed, setPageDisplayed] = useState("allarticles");
    const [serverUrl, setServerUrl] = useState("");
    const [triedFetchUserDetails, setTriedFetchUserDetails] = useState(false);
    // console.log(pageDisplayed);


    // function getServerUrl() {
    //     if (process.env.REACT_APP_RUNNING_IN_DIGITAL_OCEAN === 'true') {
    //         setServerUrl(process.env.REACT_APP_SERVER_URL_DIGITAL_OCEAN);
    //     } else {
    //         setServerUrl(process.env.REACT_APP_SERVER_URL_LOCAL);
    //     }
    //     console.log("Here is the server url", serverUrl);
    // }

    function allArticlesHandler() {
        setPageDisplayed("allarticles");
    }

    function myArticlesHandler() {
        setPageDisplayed("myarticles");
    }

    function myVotesHandler() {
        setPageDisplayed("myvotes");
    }

    function myNotificationsHandler() {
        setPageDisplayed("mynotifications");
    }

    function setTryFetchUserDetails() {
        setTriedFetchUserDetails(true);
    }

    // useEffect(() => {
    //     console.log("useEffect in App");
    //     getServerUrl();
    // },
    //     [getServerUrl, serverUrl]
    // )

    return (
        <>
            <NavAppBar
                allArticlesHandler={allArticlesHandler}
                myArticlesHandler={myArticlesHandler}
                myVotesHandler={myVotesHandler}
                myNotificationsHandler={myNotificationsHandler}
                setTryFetchUserDetails={setTryFetchUserDetails}
                // serverUrl={serverUrl}
            />
            <NewArticlePostUrlInput />
            <MainGrid
                pageDisplayed={pageDisplayed}
                triedFetchUserDetails={triedFetchUserDetails}
                // serverUrl={serverUrl}
            />
        </>
    )
}

export default App;