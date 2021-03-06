const {ApolloClient, createNetworkInterface} = window.apolloClient;
const {ApolloProvider} = window.reactApollo;

const SessionsWithData = window.SessionsWithData;

const networkInterface = createNetworkInterface({
  uri: '/graphql'
});
const client = new ApolloClient({networkInterface});

ReactDOM.render(
    <ApolloProvider client={client}>
      <SessionsWithData />
    </ApolloProvider>,
  document.getElementById('app')
);
