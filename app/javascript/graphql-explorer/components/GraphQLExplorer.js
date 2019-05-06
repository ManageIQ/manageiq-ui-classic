import React from 'react';
import GraphiQL from 'graphiql';

export default class GraphQLExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetcher: this.props.fetcher
    };
  }

  render() {
    return (
      <GraphiQL ref={c => { this.graphiql = c; }} {...this.state}>
        <GraphiQL.Logo>
          ManageIQ GraphQL Explorer
        </GraphiQL.Logo>
      </GraphiQL>
    );
  }
}
