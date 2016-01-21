# Distinct Tweet Lists

This is a simple web app intended to make it easier to move the stuff you follow on twitter from list to list - with drag and drop only.

It's still pretty raw and lots of functionalities are not yet implemented - for example it relies on existing lists mostly.

Note, that it does expect all tweet Friends/Members to belong to some lists and **creates Default** list where all unlisted Friends/Members are put. It happens when you press _Detect unlisted friends_ link.

It's also intended to work as standalone app for one user.

## Installation

```
git clone git@github.com:dmitry-yudakov/distinct-twit-lists.git
cd distinct-twit-lists
npm install
```

## Running

```sh
node app.js
```

In web browser open http://localhost:3000