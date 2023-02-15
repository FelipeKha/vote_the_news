import React, { useState } from "react";

import NavAppBar from "./NavAppBar";
import NewArticlePostUrlInput from "./NewArticlePostUrlInput";
import MainGrid from "./MainGrid";

function App() {
    const [pageDisplayed, setPageDisplayed] = useState("allarticles");
    const [triedFetchUserDetails, setTriedFetchUserDetails] = useState(false);

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