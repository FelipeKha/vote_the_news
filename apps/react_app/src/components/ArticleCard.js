import React, { useContext } from 'react';

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { UserContext } from "../context/UserContext";


function ArticleCard(props) {
  const [userContext, setUserContext] = useContext(UserContext);

  const fetchVoteUrl = process.env.REACT_APP_SERVER_URL + `${props.articleInfo._id}/vote`;
  const fetchDeleteUrl = process.env.REACT_APP_SERVER_URL + `${props.articleInfo._id}/delete`;

  function fetchUpVote() {
    fetch(
      fetchVoteUrl,
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

  function fetchDeleteArticle() {
    fetch(
      fetchDeleteUrl,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`
        }
      }
    )
      .then(response => {
        if (response.ok) {
          console.log("deleted");
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  return (
    <Badge
      badgeContent=
      < Tooltip title="Remove">
        <IconButton
          onClick={fetchDeleteArticle}
        >
          <RemoveCircleIcon></RemoveCircleIcon>
        </IconButton>
      </Tooltip>
      color="default"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      invisible={props.pageDisplayed !== "myarticles"}
    >
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
            image={props.articleInfo.linkPreview.img ? props.articleInfo.linkPreview.img : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png"}
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
              {props.articleInfo.linkPreview.title ? props.articleInfo.linkPreview.title : "[NO TITLE]"}
            </Typography>
            <Typography
              gutterBottom
              variant="body2"
              color="text.secondary"
              align="left"
              lineHeight={1.2}
            >
              {props.articleInfo.linkPreview.description ? props.articleInfo.linkPreview.description : "[NO DESCRIPTION]"}
            </Typography>
            <Typography
              variant="overline"
              color="text.secondary"
              align="right"
              lineHeight={1}
            >
              {props.articleInfo.linkPreview.domain ? props.articleInfo.linkPreview.domain : "[NO DOMAIN]"}
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
    </Badge >
  );
}

export default ArticleCard;