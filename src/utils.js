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
  // oracle: new ApolloClient({
  //   uri: 'http://192.168.1.87:8000/subgraphs/name/bellecour/oracle-watcher',
  //   cache: new InMemoryCache(),
  // }),
  oracle: new ApolloClient({
    uri: 'https://graphnodeirx5kk8z-graphnoe.functions.fnc.fr-par.scw.cloud/subgraphs/name/bellecour/oracle-watcher',
    cache: new InMemoryCache(),
  }),
};

export const confMap = {
  viviani: {
    ORACLE_APP_ADDRESS: '0xe7da3c01bbc71dacb05c30b7832214d82a045e70',
    ORACLE_CONTRACT_ADDRESS: '0x8eceddd1377e52d23a46e2bd3df0afe35b526d5f',
  },
  bellecour: {
    ORACLE_APP_ADDRESS: '0x05a2915f4c5a87fd3084c59e1a379449a54985f5',
    ORACLE_CONTRACT_ADDRESS: '0x456891c78077d31f70ca027a46d68f84a2b814d4',
  },
};
