import { OfflineMail } from "./OfflineMail.js";

class Index extends React.PureComponent {
  render(){
    return React.createElement(
      "div", {}, [
        React.createElement("h1", { key: 0 }, "Offline Mail"),
        React.createElement(OfflineMail, { key: 1 }),
      ]
    );
  }
}

ReactDOM.render(
  React.createElement(Index),
  document.getElementById("react")
);
