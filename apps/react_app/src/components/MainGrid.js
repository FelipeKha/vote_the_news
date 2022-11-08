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
  const [lastPostTime, setLastPostTime] = useState("");
  const [allArticlesLoaded, setAllArticlesLoaded] = useState(false);
  const [prevY, setPrevY] = useState(0);
  const [userContext, setUserContext] = useContext(UserContext);
  const [lastArticleCard, setLastArticleCard] = useState(null)
  const [shouldFetch, setShouldFetch] = useState(false)
  const ref = useRef();

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        observerTrigger++;
        console.log(`observer triggered ${observerTrigger}`);
        // console.log(articlesArray);
        // const newLastPostTime = articlesArray[articlesArray.length - 1].postTime;
        // setLastPostTime(newLastPostTime);
        // fetchArticlesArray();
        setShouldFetch(true)
      }
    })
  );

  function fetchArticlesArray(lastPostTimeInput) {
    fetchCalled++
    console.log(`fetchArticlesArray called ${fetchCalled}`);
    console.log(lastPostTime);

    setLoading(true);

    const fetchArticlesArrayUrl = process.env.REACT_APP_SERVER_URL + `${props.pageDisplayed}`
    // const fetchArticlesArrayUrl = props.serverUrl + `${props.pageDisplayed}`

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
          if (data.length !== 0) {
            setIsLoaded(true);
            setArticlesArray(oldValues => {
              return [...oldValues, ...data];
            })
            const newLastPostTime = data[data.length - 1].postTime;
            console.log('newLastPostTime:', newLastPostTime);
            setLastPostTime(newLastPostTime);
          } else {
            console.log('No more articles');
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

  function renderArticlePost(articleInfo) {
    return (
      <Item>
        <ArticleCard
          articleInfo={articleInfo}
          key={articleInfo.id}
        />
      </Item>
    );
  }

  useEffect(() => {
    useEffectCalled++
    console.log(`useEffect called ${useEffectCalled}`);
    console.log(`lastPostTime: ${lastPostTime}`);
    fetchArticlesArray(lastPostTime);
    console.log(`lastPostTime: ${lastPostTime}`);
  },
    []
  )

  // useEffect(() => {
  //   setArticlesArray([])
  //   fetchArticlesArray();
  //   console.log("Second useEffect ran");
  // },
  //   [props.pageDisplayed]
  // )


  // useEffect(() => {
  //   const currentElement = ref.current;
  //   const currentObserver = observer.current;

  //   if (currentElement) {
  //     currentObserver.observe(currentElement);
  //   }

  //   return () => {
  //     if (currentElement) {
  //       currentObserver.unobserve(currentElement);
  //     }
  //   };
  // }, [ref]);

  useEffect(() => {
    console.log(lastPostTime);
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
    console.log(`useEffect shouldFetch: ${lastPostTime}`);
    if (shouldFetch) {
      fetchArticlesArray(lastPostTime);
    }
  },
    [shouldFetch, lastPostTime]
  )

  return (
    <Box sx={{ flexGrow: 1 }}>
      {console.log(lastPostTime)}
      <Grid
        container
        spacing={2}
      >
        {articlesArray.map((article, i) => {
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