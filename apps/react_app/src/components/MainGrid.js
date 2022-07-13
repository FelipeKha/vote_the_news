import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

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
      isLoggedIn: false,
      user: '',
      items: []
    }

    this.handleNewArticlePosted = this.handleNewArticlePosted.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
  }

  componentDidMount() {
    fetch("http://localhost:4000/")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )

    fetch("http://localhost:4000/isloggedin")
      .then(res => res.json())
      .then(
        (result) => {
          console.log('');
        }
      )
  }

  handleNewArticlePosted(newArticlesList) {
    this.setState({ items: newArticlesList })
  }

  handleLogin(user) {
    this.setState({
      isLoggedIn: true,
      user: user
    });
  }

  handleLogout() {
    this.setState({
      isLoggedIn: false,
      user: ''
    });
  }

  renderArticlePost(articleInfo) {
    return (
      <Grid item xs={4}>
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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Item>
              <NavAppBar
                isLoggedIn={this.state.isLoggedIn}
                user={this.state.user}
                onLogin={this.handleLogin}
                onLogout={this.handleLogout}
              />
            </Item>
          </Grid>
          <Grid item xs={12}>
            <Item>
              <NewArticlePostUrlInput />
            </Item>
          </Grid>
          {this.state.items.map((item) => this.renderArticlePost(item))}
        </Grid>
      </Box>
    );
  }
}

export default MainGrid;