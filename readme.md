# Vote The News

[Vote The News (VTN)](PASTEURLHERE.COM) is a web application to share and vote press articles. The user posts an article by submitting its url, and the application will create a card with an overview of the article. Users can then consult the article cards, click the cards to consult the articles on their publisher's website, and vote for their favorite articles.

I built VTN as a student project on my path to becoming a developer. VTN is built entirely with JavaScript. [Here](https://www.linkedin.com/in/felipe-kharaba-11481444/) is the link to my LinkedIn profile if you want to know more about me.

I would like to express my deep gratitude to my friend [Adrien Vaschalde](https://www.linkedin.com/in/avaschalde/) who has become a mentor to me. Thank you for the support and the infinite time you have given to me ever since I emitted the idea of leaving my finance career to become a developer.

## Run VTN locally

In your terminal, clone the project with the command `git clone https://github.com/FelipeKha/vote_the_news.git`.
Then run `npm install` to install all the libraries required for the project.
Finally, run `docker-compose -f docker-compose.yml up --build` to build the docker and start the containers.

You can open your browser at `http://localhost:3000/` to visual the web app.

## VTN functionalities (ADD EXPLANATION FOR HOW TO FOR EACH FUNCTIONALITY)

### User profile:
- Sign up
- Sign in
- Log out
- Edit profile

### Post and vote article:
- Post new articles
- Delete a post
- Vote for an article
- Unvote for an article

### Visualise articles feed:
- Visualise articles ordered chronologically
- Visualise articles ordered by number of votes
- Visualise my articles
- Visualise my votes

## VTN architecture
### VTN server
- Server
Requests to the server are managed by two [**express**](https://www.npmjs.com/package/express) routers, one for the articles routes and one for the user routes. CORS are managed by [**cors**](https://www.npmjs.com/package/cors) (mainly for the origin of the requests). We use [**express-session**](https://www.npmjs.com/package/express-session) to transfer the sessions used for authentication. The requests body are parsed with the [**body-parser**](https://www.npmjs.com/package/body-parser) middleware.
- Authentication
Authentication with [**passport**](https://www.npmjs.com/package/passport) with JSON web token for access.
 - User sign up or sign in. We are using the local strategy of [**passport-local**](https://www.npmjs.com/package/passport-local) to login with username and password. At sign in, the refresh token (valid for 30 days) and JWT (valid for 15min) are generated with [**jsonwebtoken**](https://www.npmjs.com/package/jsonwebtoken). The refresh token for this user is stored in the database and sent to the session (we use [**cookie-parser**](https://www.npmjs.com/package/cookie-parser) to create and read the cookie), and the JWT is sent to the user to be stored in the local storage. We are using the [**passport-local-mongoose**](https://www.npmjs.com/package/passport-local-mongoose) plugin to build the username and password with passport in the user mongoose schema.
 - Every 5min, the react app will send a silent refresh request to the server to update the refresh token and the JWT. The refresh token received from the user's session will be checked for the refresh token secret, and then for the refresh token saved in the database. We will then renew the refresh token and JWT.
 - When sending a request that require authentication, the JWT must be sent in the header of the request. It will be then checked with the JWT strategy of [**passport-jwt**](https://www.npmjs.com/package/passport-jwt).
 - When user logout, the refresh token is deleted from the session and the database, and the JWT is deleted from the local memory by the react app.

- Database
We use a Mongo database, and use [**mongoose**](https://www.npmjs.com/package/mongoose) to Create, Read, Update and Delete (CRUD). The data is structured in four schemas (article, user, vote and session for authentication). The schemas are crossed referenced on certain items so that that we can populate related data between schemas (e.g. get the autor of a post). We also use some built in mongoose functionalities to order results or limit the number of requests.
- Web scrapping
In order to get the article's card element, we use a slightly modified version of [Andrej Gajdos's link preview generator](https://github.com/AndrejGajdos/link-preview-generator).
 - We use [**puppeteer-extra**](https://www.npmjs.com/package/puppeteer-extra) to open the article in a browser (Chromium in local, Chrome when in production). We also use [**puppeteer-extra-plugin-stealth**](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth) to prevent detection of headless mode.
 - Once the browser is open, we look for the article cards elements (title, description, image, etc) by inspecting the meta data for Open Graph tags, then Twitter tags, and finally page elements. For the image, we use [**get-urls**](https://www.npmjs.com/package/get-urls) to extra the urls from tags or element scrapping output, [**is-base64**](https://www.npmjs.com/package/is-base64) to check if the url is a base64 string, and [**node-fetch**](https://www.npmjs.com/package/node-fetch) to check that the image url sends a response.
- Tools
 - [**dotenv**](https://www.npmjs.com/package/dotenv) is used to load environment variables from the `.env` file.
 - [**eslint**](https://www.npmjs.com/package/eslint) is used to lint the code.
 - [**jest**](https://www.npmjs.com/package/jest) is used for testing.
 - [**nodemon**](https://www.npmjs.com/package/nodemon) is used to automatically restart the server upon saving of files.

### VTN react app
- Web app
The front end of the web app is built with [**react**](https://www.npmjs.com/package/react). We are using [**@mui/material**](https://www.npmjs.com/package/@mui/material) (Material UI) elements. We also implemented an infinite scroll using the `IntersectionObserver` API in order to load progressively the article cards.

## VTN potential improvements and additional functionalies
### Potential improvements
To do
- Add cookie managements options
- Get domain for the webiste
- Get domain for me
- Deploy website on Digital Ocean
- Deploy webiste on domain
- Use NginX to run app on Docker
- Add testing for React
- Add testing for server
- Add testing for overall app
- Add environment variables to make the app work locally
- Add environment variables to make the app work on Docker
- Add environment variables to make the app work on Digital Ocean
- Have the app running even after closing Digital Ocean
- Implement rolling deployment with GitHub and Digital Ocean
- Get https for the website
- Refactor the server to include the creation of the objects in index.js
- Refactor the server to move the authentication work out of the router files
- Vote button greyed out if article already voted
- Dynamic view of the removed article when deleting an article (curently stays and needs to refresh to remove)
- Add all the newspapers to the whitelist
- Get a pop showing nice notifications rather than current solution (e.g. "[username] upvoted article [title]")
- Check that client is connected before opening the websocket, and secure the websocket for authentication


Will remain open
- Architecture improvement (TO BE EXPLAINED, SHOULD BE AN EXPLANATION OF POTENTIAL IMPROVEMENTS IF THE WEBSITE WAS TO BE USED BY MILLIONS OF USERS)
- Confirm user email
- Send updated number of notification upon event of upvote only, not every 5 seconds


### Potential additional functionalities
To do
- Delete a post
- Delete user profile
- Edit user profile
- Add about page
- Add user profile page
- Visualise articles ordered by number of votes
- Visualise my articles
- Visualise my votes
- Notification for new votes on my articles
- Implement the white list of newspaper we can post from
- Populate the about tabs
- For all the form, add first nivel of validation (mark missing requested fields red, grey out submit button if missing info, check password)

Will remain open
- Share an article
- Notify user that new articles have been posted, with button to go to top of the page and load new article cards
- Implement authentication with social logins (e.g. with Google and Facebook)
- Reset forgotten password


Process for certification:
SSH into the droplet:
`ssh root@104.248.194.185`
Enter passphrase when prompted
Go to vote_the_news directory:
`cd vote_the_news`
Get list of running containers:
`docker ps`
If vtn-react-app container running, stop it:
`docker stop vtn-react-app_name`
Run vtn-react-app-certif:
`docker compose -f docker-compose.production.yml --env-file deploy_meta.env up -d vtn-react-app-certif`
