const initializeGmail = ({transaction, db, objectStoreNames}) => {
  const exists = objectStoreNames && objectStoreNames.contains && objectStoreNames.contains("messages");
  const messages = exists && transaction && transaction.objectStore
    ? transaction.objectStore("messages")
    : db && db.createObjectStore && db.createObjectStore("messages", { keyPath: [
      "Date",
      "From",
      "Subject",
    ] })
  ;
  const indexNames = messages && messages.indexNames;

  const pki = indexNames && indexNames.contains && indexNames.contains("pki")
    ? messages && messages.index && messages.index("pki")
    : messages && messages.createIndex && messages.createIndex("pki", ["Date", "From", "Subject"], { unique: true })
  ;

  const iFromDate = indexNames && indexNames.contains && indexNames.contains("fromDate")
    ? messages && messages.index && messages.index("fromDate")
    : messages && messages.createIndex && messages.createIndex("fromDate", ["From", "Date"], { unique: false })
  ;

  const iToDate = indexNames && indexNames.contains && indexNames.contains("toDate")
    ? messages && messages.index && messages.index("toDate")
    : messages && messages.createIndex && messages.createIndex("toDate", ["To", "Date"], { unique: false })
  ;

};

const initializeDb = event => {
  const { target } = event || {};
  const {
    result,
    transaction,
  } = target || {};
  const { db } = transaction || {};
  const { objectStoreNames } = result || {};

  initializeGmail({transaction, db, objectStoreNames});
};

class OfflineMail extends React.PureComponent {
  constructor(props){
    super(props);
    this.setState({
    });
  }

  componentDidMount(){
    const {
      dbname,
    } = this.props;
    return Promise.resolve(indexedDB.open("gmail", 0x1804))
    .then(request => new Promise(opened => {
      request.onsuccess = opened;
      request.onerror   = opened;
      request.onupgradeneeded = initializeDb;
    }))
    .then(event =>{
    })
    ;
  }

  render(){
    return React.createElement(
      "div", {}, "Choose Provider"
    );
  }
}

export {
  OfflineMail,
}
