import express from 'express';
import fs from 'fs';
import path from 'path';
import http from 'http';
import fetch from 'cross-fetch';
import {createServer, ViteDevServer} from 'vite';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import {ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject} from "@apollo/client";

import { typeDefs } from './types-definitions';
import { resolvers } from './resolvers';

const isProd = process.env.NODE_ENV === 'prod';
const ROOT_DIR = process.cwd();
const PORT = 8080;

async function startServer() {
  const app = express();

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground()
    ],
  });
  await server.start();
  server.applyMiddleware({ app, path: '/api/graphql' });

  let vite: ViteDevServer;
  if (!isProd) {
    vite = await createServer({
      server: { middlewareMode: 'ssr' }
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(require('compression')())
    app.use(express.static(path.resolve(ROOT_DIR, 'dist/client'), { index: false }))
  }

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const htmlPath = isProd ? path.resolve(ROOT_DIR, 'dist/client/index.html') : path.resolve(ROOT_DIR, 'index.html');

      let template = fs.readFileSync(
        htmlPath,
        'utf-8'
      )

      let render: (url: string, client: ApolloClient<NormalizedCacheObject>) => Promise<string>;
      if (isProd) {
        render = require(path.resolve(ROOT_DIR, 'dist/server/main.server.js')).render;
      } else {
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule(path.resolve(ROOT_DIR, '/app/main.server.tsx'))).render
      }

      const apolloClient = new ApolloClient({
        ssrMode: true,
        link: createHttpLink({
          uri: `http://localhost:${PORT}${server.graphqlPath}`,
          credentials: 'same-origin',
          fetch
        }),
        cache: new InMemoryCache(),
      })

      const appHtml = await render(url, apolloClient);
      const apolloState = apolloClient.extract();

      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace('<!--script-apollo-state-->', `
          <script>
            window.__APOLLO_STATE__='${JSON.stringify(apolloState).replace(/</g, '\\u003c')}';
          </script>
        `)

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch(e: any) {
      if (!isProd) {
        vite.ssrFixStacktrace(e)
      }
      next(e)
    }
  })

    await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 React App ready at http://localhost:${PORT}/`);
}

startServer()

