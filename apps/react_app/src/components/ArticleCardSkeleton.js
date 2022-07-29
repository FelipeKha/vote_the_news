import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';



function handleClick() {
  console.log('upvote to come');
}

function ArticleCardSkeleton() {
  return (
    <Card
    >
      <Box
        display="flex"
        justifyContent="flex-start"
      >
        <Skeleton
          animation="wave"
          height={20}
          width="20%"
          style={{ marginBottom: 6 }}
        />
      </Box>
      <Skeleton
        animation="wave"
        height={20}
        width="40%"
        style={{ marginBottom: 6 }}
      />
      <Skeleton sx={{ height: 150 }} animation="wave" variant="rectangular" />
      <CardContent>
        <Skeleton
          animation="wave"
          height={30}
          width="100%"
          style={{ marginBottom: 6 }}
        />
        <Skeleton
          animation="wave"
          height={30}
          width="40%"
          style={{ marginBottom: 6 }}
        />
        <Skeleton
          animation="wave"
          height={20}
          width="100%"
          style={{ marginBottom: 6 }}
        />
        <Skeleton
          animation="wave"
          height={20}
          width="95%"
          style={{ marginBottom: 6 }}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Skeleton
            animation="wave"
            height={20}
            width="25%"
            style={{ marginBottom: 6 }}
          />
        </Box>
      </CardContent>
      <Divider variant="middle" />
      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        spacing={0}
        marginY={0.5}
      >
        <Skeleton
          animation="wave"
          height={40}
          width="15%"
          style={{ marginBottom: 6 }}
        />
        <Skeleton
          animation="wave"
          height={20}
          width="10%"
          style={{ marginBottom: 6 }}
        />
      </Stack>
    </Card >
  );
}

export default ArticleCardSkeleton;