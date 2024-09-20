# Challenge Prediction

## How to setup development environment
  - Install Visual Studio Code IDE https://code.visualstudio.com/
  - Install NodeJS (v20 LTS) https://nodejs.org/en/download/prebuilt-installer
  - Update npm:
    ```
      npm install -g npm@latest
    ```
  - Install Git https://git-scm.com/download/win

## How to checkout project source code from GitHub and install dependencies

  Checkout:
  ```shellscript
  git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
  ```

  Change current directory to project folder and install dependencies:
  ```shellscript
  npm install
  ```

## How to run application in Development mode

Run the dev server:

```shellscript
npm run dev
```

## How to run application in Production mode

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

# How to use the application

  Input data are stored in **stock_price_data_files** folder at project level.

  If running in production mode access the app at: http://localhost:3000/
  If running in development mode acces the app at: http://localhost:5173/

  Select Reccomended number of files to be sampled for each Stock Exchange
  Press the Predict button

  Follow the output csv files in **stock_price_prediction_files** folder at project level in subfolder named as current datetime.


## Steps creating the project
  - Follow quick start Remix guidelines https://remix.run/docs/en/main/start/quickstart
  ```
  npx create-remix@latest
  ```

## Resouces
  - Mardown basic syntax https://www.markdownguide.org/basic-syntax/
  - Use tiny-glob module to find csv data files https://www.npmjs.com/package/tiny-glob
  - Use readline https://nodejs.org/docs/latest-v20.x/api/readline.html and example from https://medium.com/hail-trace/effortlessly-reading-files-line-by-line-in-node-js-7775f27c40cc
  - Use date-and-time
 module to parse and format dates https://www.npmjs.com/package/date-and-time
 - Find second highest price in prediction alghorithm https://umarfarooquekhan.medium.com/find-the-second-largest-element-in-an-array-using-a-single-loop-in-javascript-dbeb0c42c58d


