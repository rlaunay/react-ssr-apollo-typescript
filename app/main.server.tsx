import { StrictMode } from 'react';
import { StaticRouter } from "react-router-dom/server";
import {
  ApolloProvider,
  ApolloClient,
  NormalizedCacheObject
} from '@apollo/client';
import { renderToStringWithData } from "@apollo/client/react/ssr";
import App from "./App";

export async function render(url: string, client: ApolloClient<NormalizedCacheObject>) {

  return renderToStringWithData(
    <StrictMode>
      <ApolloProvider client={client}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    </StrictMode>
  )
}