# streaming likes

## Installation

run
`npm install`
and
`bower install`
 to install Express, AngularJS and other dependencies


## Run on Windows

Run this command to set super secret keys as environment variables, and run then node application.

`
set TWITTER_CONSUMER_KEY=zzz && set TWITTER_CONSUMER_SECRET=zzz && set TWITTER_ACCESS_TOKEN_KEY=zzz && set TWITTER_ACCESS_TOKEN_SECRET=zzz && npm start
`
or
`
export TWITTER_CONSUMER_KEY=zzz && export TWITTER_CONSUMER_SECRET=zzz && export TWITTER_ACCESS_TOKEN_KEY=zzz && export TWITTER_ACCESS_TOKEN_SECRET=zzz && npm start
`

Then start chrome in App Mode `chrome.exe --app=http://localhost:8080`
or
`
cd /Applications/Google\ Chrome.app/Contents/MacOS; ./Google\ Chrome --app=http://localhost:8080
`