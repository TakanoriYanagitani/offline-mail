class Index extends React.PureComponent {
  render(){
    return React.createElement(
      "h1", {}, "Offline Mail"
    );
  }
}

ReactDOM.render(
  React.createElement(Index),
  document.getElementById("react")
);
