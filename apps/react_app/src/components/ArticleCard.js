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

import domainsAndLogos from '../logos/domainsAndLogos.js';
import { UserContext } from "../context/UserContext";
import { shadows } from '@mui/system';


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
          props.upVoteLocalEffect(props.articleInfo._id);
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

  function upVote() {
    fetchUpVote();
  }

  function formatDate(date) {
    let dateObj = new Date(date);
    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();
    let year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
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
      style={{
        width: "100%",
        height: "100%",
        alignSelf: "flex-end",
      }}
    >
      <Card
        style={{
          border: "0.5px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "none",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
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
          {formatDate(props.articleInfo.postTime)}
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
            style={{
              borderTop: "0.25px solid rgba(0, 0, 0, 0.12)",
              borderBottom: "0.25px solid rgba(0, 0, 0, 0.12)",
            }}
          />
          <CardContent>
            <Typography
              variant="h6"
              component="div"
              color="text.primary"
              align="left"
              lineHeight={1.4}
              marginBottom={1}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
              }}
            >
              {props.articleInfo.linkPreview.title ? props.articleInfo.linkPreview.title : "[NO TITLE]"}
            </Typography>
            <Typography
              gutterBottom
              variant="body2"
              color="text.secondary"
              align="left"
              lineHeight={1.2}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: '-webkit-box',
                WebkitLineClamp: '4',
                WebkitBoxOrient: 'vertical',
              }}
            >
              {props.articleInfo.linkPreview.description ? props.articleInfo.linkPreview.description : "[NO DESCRIPTION]"}
            </Typography>
          </CardContent>
        </Link>
        <Link
          href={'http://' + props.articleInfo.linkPreview.domain}
          underline="none"
          target="_blank"
          rel="noopener"
          style={{
            marginTop: "auto",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            align="right"
            lineHeight={1}
            style={{
              height: "auto",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {
              props.articleInfo.linkPreview.domain ?
                props.articleInfo.linkPreview.domain in domainsAndLogos ?
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    style={{
                      padding: "10px",
                      objectFit: "contain",
                      width: "90%",
                      height: "20px",
                    }}
                    image={domainsAndLogos[props.articleInfo.linkPreview.domain]}
                  />
                  : props.articleInfo.linkPreview.domain
                : "[NO DOMAIN]"
            }
          </Typography>
        </Link>
        <Divider
          variant="middle"
        />
        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          spacing={0}
          marginY={0.5}
        >
          {
            props.articleInfo.userVoted ?
              <Chip
                label="+Vote"
                onClick={upVote}
                style={{
                  border: "1px solid #bdbdbd",
                }}
              />
              :
              <Chip
                variant="outlined"
                label="+Vote"
                onClick={upVote}
              />
          }
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