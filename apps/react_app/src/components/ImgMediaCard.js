import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function ImgMediaCard(props) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image={props.articleInfo.linkPreview.img}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props.articleInfo.linkPreview.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {props.articleInfo.linkPreview.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Number of votes: {props.articleInfo.numberOfVotes}</Button>
        <Button size="small">+Vote</Button>
      </CardActions>
    </Card>
  );
}

export default ImgMediaCard;