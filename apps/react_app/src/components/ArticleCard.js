import React, { useContext } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { UserContext } from "../context/UserContext";



function ArticleCard(props) {
  const [userContext, setUserContext] = useContext(UserContext);

  function fetchUpVote() {
    fetch(
      `http://localhost:4000/${props.articleInfo._id}/vote`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`
        }
      }
    )
      .then(response => {
        if (response.ok) {
          console.log("upvoted");
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  return (
    <Card
    >
      <Box
        display="flex"
        justifyContent="flex-start"
      >
        <Button
          size="small"
          sx={{
            textTransform: "none",
            padding: "0",
            justifyContent: "flex-start",
            color: "rgba(0, 0, 0, 0.6)"
          }}
        >
          {props.articleInfo.author.nameDisplayed}
        </Button>
      </Box>
      <Typography
        color="text.secondary"
        variant="body2"
        align="left"
        margin={0}
      >
        {props.articleInfo.postTime}
      </Typography>
      <Link
        href={props.articleInfo.url}
        underline="none"
        target="_blank"
        rel="noopener"
      >
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
            color="text.primary"
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
      </Link>
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
          onClick={fetchUpVote}
        />
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {props.articleInfo.numUpVotes}
          {(props.articleInfo.numUpVotes === 0 ||
            props.articleInfo.numUpVotes === 1) ?
            <> vote</>
            : <> votes</>
          }
        </Typography>
      </Stack>
    </Card >
  );
}

export default ArticleCard;