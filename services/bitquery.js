import { post } from 'axios';

// Set up your Bitquery API key
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY;

// Function to get whale account data from Bitquery
const getWhaleTransactions = async () => {
    const query = `
    {
      ethereum(network: bsc) {
        transfers(
          options: {limit: 10, desc: "value"},
          amount: {gt: 1000000},
          currency: {is: "BNB"}
        ) {
          transaction {
            hash
          }
          sender {
            address
          }
          receiver {
            address
          }
          amount
        }
      }
    }`;

    const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': BITQUERY_API_KEY
    };

    try {
        const response = await post('https://graphql.bitquery.io/', {
            query
        }, { headers });

        return response.data.data.ethereum.transfers;
    } catch (error) {
        console.error("Error fetching whale transactions:", error);
        return [];
    }
};

export default { getWhaleTransactions };
