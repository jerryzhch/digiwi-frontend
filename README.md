# WiDiGi - Digital Winterthur Hackathon Challenge

## Install Dependencies

First of all we need to install dependencies, run in terminal
```
npm install
```

To enable to full experience, the backend needs to be setup aswell. Clone this [repo](https://github.com/jerryzhch/digiwi-backend). Open the executable BackendApi under digiwi-backend\BackendApi\BackendApi\bin\Debug\net5.0. The port should be 5000. If not, please adjust the shown port in the frontend project under digiwi-frontend\src\js in app.js (line 20).

To start application, run

```
npm start
```

and open the shown localhost link. Enjoy!

## NPM Scripts

* 🔥 `start` - run development server
* 🔧 `dev` - run development server
* 🔧 `build` - build web app for production

## Vite

There is a [Vite](https://vitejs.dev) bundler setup. It compiles and bundles all "front-end" resources. You should work only with files located in `/src` folder. Vite config located in `vite.config.js`.
