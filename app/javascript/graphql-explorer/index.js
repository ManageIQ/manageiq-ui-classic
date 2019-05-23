import React from 'react';
import GraphQLExplorer from './components/GraphQLExplorer';
import graphQLFetcher from './helpers/graphQLFetcher';

export default () => (
  <GraphQLExplorer fetcher={graphQLFetcher} />
);
