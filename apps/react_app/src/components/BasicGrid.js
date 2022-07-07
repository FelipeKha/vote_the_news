import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import ButtonAppBar from './ButtonAppBar';
import ImgMediaCard from './ImgMediaCard';
import CustomizedInputBase from './CustomizedInputBase';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

class BasicGrid extends React.Component {
  constructor(props) {
    super(props);
    this.handleNewArticlePosted = this.handleNewArticlePosted.bind(this);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    }
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
  }

  handleNewArticlePosted(newArticlesList) {
    this.setState({ items: newArticlesList })
  }

  renderArticlePost(articleInfo) {
    return (
      <Grid item xs={4}>
        <Item>
          <ImgMediaCard
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
              <ButtonAppBar />
            </Item>
          </Grid>
          <Grid item xs={12}>
            <Item>
              <CustomizedInputBase />
            </Item>
          </Grid>
          {this.state.items.map((item) => this.renderArticlePost(item))}
        </Grid>
      </Box >
    );
  }
}

export default BasicGrid;