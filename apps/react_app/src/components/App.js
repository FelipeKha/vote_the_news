import React, { useState } from "react";

import NavAppBar from "./NavAppBar";
import NewArticlePostUrlInput from "./NewArticlePostUrlInput";
import MainGrid from "./MainGrid";

function App() {
    // console.log("App rendered");
    const [pageDisplayed, setPageDisplayed] = useState("allarticles");
    // console.log(pageDisplayed);

    function allArticlesHandler() {
        setPageDisplayed("allarticles");
    }

    function myArticlesHandler() {
        setPageDisplayed("myarticles");
    }

    function myVotesHandler() {
        setPageDisplayed("myvotes");
    }

    return (
        <>
            <NavAppBar
                allArticlesHandler={allArticlesHandler}
                myArticlesHandler={myArticlesHandler}
                myVotesHandler={myVotesHandler}
            />
            <NewArticlePostUrlInput />
            <MainGrid
                pageDisplayed={pageDisplayed}
            />
        </>
    )
}

export default App;