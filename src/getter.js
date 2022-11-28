import { gql } from '@apollo/client';

export const getOracles = gql`
  query GetOracles {
    oracles(first: 1000) {
      id
      updateCount
      history(orderBy: date, orderDirection: asc) {
        id
        date
      }
    }
  }
`;

export const getDeals = gql`
  query GetDeals($timestamp: BigInt!) {
    deals(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: {
        app: "0xe720999114874c2d8972da893e96909f3a578abb"
        timestamp_lt: $timestamp
      }
    ) {
      id
      timestamp
      requester {
        id
      }
      appPrice
      datasetPrice
      workerpoolPrice
      dataset {
        id
      }
      params
      completedTasksCount
      tasks {
        id
        status
        timestamp
        events {
          timestamp
        }
      }
    }
  }
`;
