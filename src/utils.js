import { ApolloClient, InMemoryCache } from '@apollo/client';

export const round = (value, precision) => {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

export const SUBGRAPH_CLIENTS = {
  poco: new ApolloClient({
    uri: 'https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5',
    cache: new InMemoryCache(),
  }),
  oracle: new ApolloClient({
    uri: 'https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/of-oracle-watcher',
    cache: new InMemoryCache(),
  }),
};
