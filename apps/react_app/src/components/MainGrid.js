import * as React from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import NavAppBar from './NavAppBar';
import ArticleCard from './ArticleCard';
import NewArticlePostUrlInput from './NewArticlePostUrlInput';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

class MainGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      loading: false,
      articlesArray: [],
      lastPostTime: "",
      allArticlesLoaded: false,
      prevY: 0
    }

    this.handleNewArticlePosted = this.handleNewArticlePosted.bind(this);
  }

  componentDidMount() {
    this.getArticles();

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    }

    const observer = new IntersectionObserver(
      this.handleIntObs.bind(this),
      options
    )

    observer.observe(this.loadingRef)
  }

  getArticles() {
    this.setState({ loading: true })

    const bodyObject = {
      lastPostTime: this.state.lastPostTime
    }

    const requestOptions = {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyObject)
    }

    fetch("http://localhost:4000/", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.length !== 0) {
            this.setState({
              isLoaded: true,
              articlesArray: [...this.state.articlesArray, ...result]
            });
            const lastPostTime = result[result.length - 1].postTime;
            this.setState({ lastPostTime: lastPostTime });
          } else {
            this.setState({ allArticlesLoaded: true });
          }
          this.setState({ loading: false });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )

  }

  handleIntObs(entries, observer) {
    const y = entries[0].boundingClientRect.y;
    if (this.state.prevY > y) {
      if (this.state.allArticlesLoaded === false) {
        this.getArticles()
      }
    }
    this.setState({ prevY: y })
  }

  handleNewArticlePosted(newArticlesList) {
    this.setState({ articlesArray: newArticlesList })
  }

  renderArticlePost(articleInfo) {
    return (
      <Grid
        item
        xs={12} sm={6} md={4} lg={3} xl={2}
      >
        <Item>
          <ArticleCard
            articleInfo={articleInfo}
            key={articleInfo.id}
          />
        </Item>
      </Grid>
    );
  }

  render() {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          spacing={2}
        >
          <Grid item xs={12}>
            <Item>
              <NavAppBar />
            </Item>
          </Grid>
          <Grid item xs={12}>
            <Item>
              <NewArticlePostUrlInput />
            </Item>
          </Grid>
          {this.state.articlesArray.map((article) => this.renderArticlePost(article))}
        </Grid>
        <div
          ref={loadingRef => (this.loadingRef = loadingRef)}
        >
          {this.state.loading &&
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
}

export default MainGrid;