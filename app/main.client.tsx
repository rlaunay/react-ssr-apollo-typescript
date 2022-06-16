import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache
} from '@apollo/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement === null) throw new Error('No root element');

const client = new ApolloClient({
  cache: new InMemoryCache().restore(JSON.parse(window.__APOLLO_STATE__)),
  uri: 'http://localhost:8080/api/graphql'
});

hydrateRoot(rootElement,
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);