//

import * as path from "path";
import {
  CleanWebpackPlugin
} from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import merge from "webpack-merge";
import {
  Configuration
} from "webpack";


let commonConfig = {
  entry: {
    script: ["./source/script/index.ts"],
    background: ["./source/background/index.ts"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "source/[name].js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.js$/,
        enforce: "pre" as const,
        use: {
          loader: "source-map-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};

let developConfig = merge<Configuration>(commonConfig, {
  mode: "development",
  entry: {
    reload: ["./node_modules/crx-hotreload/hot-reload.js"]
  },
  devtool: "source-map",
  plugins: [
    new CopyWebpackPlugin({patterns: [{from: "manifest-develop.json", to: "manifest.json"}]})
  ]
});

let productConfig = merge<Configuration>(commonConfig, {
  mode: "production",
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({patterns: [{from: "manifest-product.json", to: "manifest.json"}]})
  ]
});

function createConfig(environment: any, args: any): Configuration {
  if (args.mode === "development") {
    return developConfig;
  } else {
    return productConfig;
  }
}

export default createConfig;