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
        app: "0x05a2915f4c5a87fd3084c59e1a379449a54985f5"
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
