import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

const someRoute = () => <div>Route 1</div>;
const route2 = () => <div> Route 2</div>;

const App = () => {
  console.log('re render');
  return (
    <HashRouter>
      <Switch>
        <Route path="/" component={someRoute} />
        <Route path="/2" component={route2} />
      </Switch>
    </HashRouter>
  );
};

export default App;
