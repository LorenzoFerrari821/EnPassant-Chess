
1) requirements:
npm install --save babel-loader @babel/core @babel/preset-env @babel/preset-react react react-dom webpack webpack-cli style-loader css-loader react-bootstrap bootstrap

2) "npm run dev" to start the "dev" script specified in package.json, "npm run prod"  to run the same script but for deployment. The scripts allow the bundling with backpack, which bundles according to the specifications of the webpack.config file. This file specifies that babel and others loaders should be used. Babels takes care of compiling the js and jsx files into a browser-readable format. The result is a static bundle that ends up in the django static folder ready to be loaded in templates.
