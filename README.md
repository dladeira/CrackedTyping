# CrackedTyping
[![CodeFactor](https://www.codefactor.io/repository/github/dladeira/crackedtyping/badge?s=bd76f7d260ab89ec39a646d626f30eddc077e174)](https://www.codefactor.io/repository/github/dladeira/crackedtyping)

CrackedTyping is a typing website that helps you boost your typing speed from average to above average.
***
Visit our website at [typing.ladeira.eu](https://typing.ladeira.eu).
***
CrackedTyping is a typing website that helps you increase your word count from average to above average. While most typing websites focus on teaching you to touch type (34-40 words per minute) this website will focus on moving you to the next level, from 40 WPM to 100 WPM.

## Getting started

First, install all the required packages
```
npm i
```

Install nodemon (required for development enviroments)
```
npm i -g nodemon
```

Then create a `.env` file and fill out all the required fields (take a look at the exemplar below) (github is optional on non-production enviroments)
```
MONGO_STRING=

GOOGLE_ID=
GOOGLE_SECRET=

GITHUB_ID=
GITHUB_SECRET=

SESSION_SECRET=
```

Finally, start the server in development mode
```
npm test
```

or start in production mode (if you're hosting your own website)
```
npm start
```
