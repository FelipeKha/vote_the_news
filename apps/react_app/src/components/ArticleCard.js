import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Stack from '@mui/material/Stack';

function handleClick() {
  console.log('upvote to come');
}

function ArticleCard(props) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <Typography
        color="text.primary"
        variant="body2"
        align="left"
      >
        {props.articleInfo.author.username}
      </Typography>
      <Typography
        color="text.secondary"
        variant="body2"
        align="left"
        margin={0}
      >
        {props.articleInfo.postTime}
      </Typography>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image={props.articleInfo.linkPreview.img}
      />
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          align="left"
          lineHeight={1.4}
          marginBottom={1}
        >
          {props.articleInfo.linkPreview.title}
        </Typography>
        <Typography
          gutterBottom
          variant="body2"
          color="text.secondary"
          align="left"
          lineHeight={1.2}
        >
          {props.articleInfo.linkPreview.description}
        </Typography>
          <Typography
            variant="overline"
            color="text.secondary"
            align="right"
            lineHeight={1}
          >
            {props.articleInfo.linkPreview.domain}
          </Typography>
      </CardContent>
      <Divider variant="middle" />
      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        spacing={0}
        marginY={0.5}
      >
        <Chip
          variant="outlined"
          icon={<HowToVoteIcon />}
          label="+Vote"
          onClick={handleClick}
        />
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {props.articleInfo.numberOfVotes} votes
        </Typography>
      </Stack>
    </Card>
  );
}

export default ArticleCard;