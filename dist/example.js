import { OfflineMail } from "./OfflineMail.js?ts=io7jp";

const {
  Grid,
  Row,
  Col,
} = window.ReactBootstrap;

class Index extends React.PureComponent {
  render(){
    return React.createElement(Grid, {}, React.createElement(
      Row, {}, [
        React.createElement(Col, { key: 0, xs: 12 }, React.createElement("h1", {}, "Offline Mail")),
        React.createElement(Col, { key: 1, xs: 12 }, React.createElement(OfflineMail)),
      ]
    ));
  }
}

ReactDOM.render(
  React.createElement(Index),
  document.getElementById("react")
);
