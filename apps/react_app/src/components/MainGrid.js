import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import ArticleCard from './ArticleCard';
import { UserContext } from '../context/UserContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

let fetchCalled = 0;
let useEffectCalled = 0;
let observerTrigger = 0;
let renderNb = 0;

function MainGrid(props) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [articlesArray, setArticlesArray] = useState([]);
  const [articlesVotesObject, setArticlesVotesObject] = useState({});
  const [lastPostTime, setLastPostTime] = useState("");
  const [allArticlesLoaded, setAllArticlesLoaded] = useState(false);
  const [prevY, setPrevY] = useState(0);
  const [userContext, setUserContext] = useContext(UserContext);
  const [lastArticleCard, setLastArticleCard] = useState(null)
  const [shouldFetch, setShouldFetch] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(props.pageDisplayed)
  const ref = useRef();

  const fetchArticlesArrayUrl = process.env.REACT_APP_SERVER_URL + `${props.pageDisplayed}`;
  const wsServerUrl = process.env.REACT_APP_WEBSOCKET_URL_VOTES;

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        observerTrigger++;
        // console.log(`observer triggered ${observerTrigger}`);
        // console.log(articlesArray);
        // const newLastPostTime = articlesArray[articlesArray.length - 1].postTime;
        // setLastPostTime(newLastPostTime);
        // fetchArticlesArray();
        setShouldFetch(true);
      }
    })
  );

  function fetchArticlesArray(lastPostTimeInput) {
    fetchCalled++
    // console.log(`fetchArticlesArray called ${fetchCalled}`);
    // console.log(lastPostTime);

    setLoading(true);

    fetch(
      fetchArticlesArrayUrl,
      {
        method: 'POST',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`

        },
        body: JSON.stringify({ lastPostTime: lastPostTimeInput })
      }
    )
      .then(async response => {
        if (response.ok) {
          const data = await response.json();
          const articlesArray = data.articlesArray
          if (articlesArray !== 0) {
            setIsLoaded(true);
            setArticlesArray(oldValues => {
              return [...oldValues, ...articlesArray];
            })
            const newLastPostTime = articlesArray[articlesArray.length - 1].postTime;
            // console.log('newLastPostTime:', newLastPostTime);
            setLastPostTime(newLastPostTime);
            setAllArticlesLoaded(data.lastArticle);
          } else {
            // console.log('No more articles');
            setAllArticlesLoaded(true);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        setIsLoaded(true);
        setError(err);
      })
  }

  function handleNewArticlePosted(newArticlesList) {
    setArticlesArray(newArticlesList)
  }

  function upVoteLocalEffect(articleId) {
    if (articlesVotesObject[articleId]) {
      const newUserVoted = !articlesVotesObject[articleId].userVoted;
      let newVoteCount;
      newUserVoted ?
        newVoteCount = articlesVotesObject[articleId].numUpVotes + 1 :
        newVoteCount = articlesVotesObject[articleId].numUpVotes - 1;
      const newArticleVotesObject = articlesVotesObject;
      newArticleVotesObject[articleId] = {
        numUpVotes: newVoteCount,
        userVoted: newUserVoted
      }
      setArticlesVotesObject({...newArticleVotesObject});
    }
  }

  function renderArticlePost(articleInfo) {
    return (
      <Item>
        <ArticleCard
          articleInfo={articleInfo}
          upVoteLocalEffect={upVoteLocalEffect}
          pageDisplayed={props.pageDisplayed}
          key={articleInfo.id}
        />
      </Item>
    );
  }

  useEffect(() => {
    useEffectCalled++
    // console.log(`useEffect called ${useEffectCalled}`);
    // console.log(`lastPostTime: ${lastPostTime}`);
    fetchArticlesArray(lastPostTime);
    // console.log(`lastPostTime: ${lastPostTime}`);
  },
    []
  )

  useEffect(() => {
    // console.log(lastPostTime);
    const currentElement = lastArticleCard;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastArticleCard, lastPostTime]);

  useEffect(() => {
    if (shouldFetch && !allArticlesLoaded) {
      fetchArticlesArray(lastPostTime);
    }
  },
    [shouldFetch, lastPostTime]
  )

  useEffect(() => {
    if (pageLoaded !== props.pageDisplayed) {
      setArticlesArray([]);
      fetchArticlesArray("");
      setPageLoaded(props.pageDisplayed);
    }
  },
    [props.pageDisplayed]
  )

  useEffect(() => {
    console.log("Running useEffect votes");
    if (articlesArray.length !== 0 && props.triedFetchUserDetails) {
      // console.log(articlesArray);
      const socket = new WebSocket(wsServerUrl);

      function heartbeat() {
        clearTimeout(socket.pingTimeout);
        socket.pingTimeout = setTimeout(() => {
          socket.close();
        }, 30000 + 1000);
      }

      socket.addEventListener("open", () => {
        console.log("Openning websocket");
        heartbeat()
        const articleIdArray = articlesArray.map((article) => article._id);
        if (userContext.details) {
          console.log("User Context ready");
          socket.send(JSON.stringify({
            userId: userContext.details._id,
            articleIdArray: articleIdArray
          }));
        } else {
          console.log("No user context yet");
          socket.send(JSON.stringify({
            articleIdArray: articleIdArray
          }));
        }
      });

      socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.articleVotes !== undefined) {
          setArticlesVotesObject(data.articleVotes);
        } else if (data.ping === true) {
          heartbeat();
          socket.send(JSON.stringify({ pong: true }));
        }
      });

      socket.addEventListener("close", () => {
        console.log("Vote socket closed");
        clearTimeout(socket.pingTimeout);
      });

      return () => {
        socket.close();
      }
    }
  }
    , [articlesArray, userContext.details, props.triedFetchUserDetails]
  )

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid
        container
        spacing={2}
      >
        {articlesArray.map((article, i) => {
          if (articlesVotesObject[article._id]) {
            article.numUpVotes = articlesVotesObject[article._id].numUpVotes;
            article.userVoted = articlesVotesObject[article._id].userVoted;
          }
          return i === articlesArray.length - 1 ? (
            <Grid
              item
              xs={12} sm={6} md={4} lg={3} xl={2}
              key={article._id + `${i}`}
              ref={setLastArticleCard}
            >
              {renderArticlePost(article)}
            </Grid>

          ) : (
            <Grid
              item
              xs={12} sm={6} md={4} lg={3} xl={2}
              key={article._id + `${i}`}
            >
              {renderArticlePost(article)}
            </Grid>

          )
        })}
      </Grid>
      <div
      >
        {loading &&
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 2
            }}
          >
            <CircularProgress />
          </Box>
        }
      </div>
    </Box>
  );
}

export default MainGrid;

// https://stackoverflow.com/questions/58341787/intersectionobserver-with-react-hooks