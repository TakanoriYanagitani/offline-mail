const {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  ListGroup,
  ListGroupItem,
} = window.ReactBootstrap;

const populateSample = messages => {
  return messages && messages.put({
    Date: Date.now(),
    From: "sample@sample.sample",
    To:   "sample_to@sample.sample",
    Subject: "THIS IS Sample Mail",
    raw_data: {
      id: "299792458abcdef0",
      labelIds: [],
      internalDate: "",
    },
  });
};

const initializeGmailStore = ({transaction, db, objectStoreNames}) => {
  const exists = objectStoreNames && objectStoreNames.contains && objectStoreNames.contains("messages");
  const messages = exists && transaction && transaction.objectStore
    ? transaction.objectStore("messages")
    : db && db.createObjectStore && db.createObjectStore("messages", { keyPath: [
      "Date",
      "From",
      "Subject",
    ] })
  ;
  populateSample(messages);
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

const initializeGmailDb = event => {
  const { target } = event || {};
  const {
    result,
    transaction,
  } = target || {};
  const { db } = transaction || {};
  const { objectStoreNames } = result || {};

  initializeGmailStore({transaction, db, objectStoreNames});
};

const initialize = {
  gmail: initializeGmailDb,
};

const commonVersion = 0x1809;

const initializeMailProvider = event => {
  const { target } = event || {};
  const {
    result,
    transaction,
  } = target || {};
  const { db } = transaction || {};
  const { objectStoreNames } = result || {};

  const exists = objectStoreNames && objectStoreNames.contains && objectStoreNames.contains("provider");
  const store = exists && transaction && transaction.objectStore
    ? transaction.objectStore("provider")
    : db && db.createObjectStore && db.createObjectStore("provider", { keyPath: "name"})
  ;
  const indexNames = store && store.indexNames;

  const pki = indexNames && indexNames.contains && indexNames.contains("pki")
    ? store && store.index && store.index("pki")
    : store && store.createIndex && store.createIndex("pki", "name", { unique: true })
  ;

  const iPriority = indexNames && indexNames.contains && indexNames.contains("priority")
    ? store && store.index && store.index("priority")
    : store && store.createIndex && store.createIndex("priority", ["priority", "name"], { unique: true })
  ;

};

class ProviderSelect extends React.PureComponent {
  render(){
    const { provider_list } = this.props;
    return React.createElement(
      FormGroup, { controlId: "provider-select" }, [
        React.createElement(ControlLabel, { key: 0 }, "Select Email Provider"),
        React.createElement(FormControl,  { key: 1, componentClass: "select", placeholder: "gmail" }, (provider_list || []).map(
          (provider_info, key) => React.createElement(
            "option", { value: (provider_info || {}).name, key }, (provider_info || {}).name
          )
        )),
      ]
    );
  }
}

class MailViewForm extends React.PureComponent {
  render(){
    const { provider_list } = this.props;
    return React.createElement(
      "form", {}, [
        React.createElement(ProviderSelect, { key: 0, provider_list }),
      ]
    );
  }
}

class MailDate extends React.PureComponent {
  render(){
    const { children } = this.props;
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "Date"),
        React.createElement("dd", { key: 1 }, new Date(children).toISOString()),
      ]
    );
  }
}

class MailFrom extends React.PureComponent {
  render(){
    const { children } = this.props;
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "From"),
        React.createElement("dd", { key: 1 }, children),
      ]
    );
  }
}

class MailSubject extends React.PureComponent {
  render(){
    const { children } = this.props;
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "Subject"),
        React.createElement("dd", { key: 1 }, children),
      ]
    );
  }
}

class MailView extends React.PureComponent {
  render(){
    const {
      Date,
      From,
      Subject,
      raw_data,
    } = this.props || {};
    return React.createElement(
      Row, { className: "OM-MailView" }, [
        React.createElement(Col, { key: 0, xs: 12, lg: 4 }, React.createElement(MailDate, {}, Date)),
        React.createElement(Col, { key: 0, xs: 12, lg: 4 }, React.createElement(MailFrom, {}, From)),
        React.createElement(Col, { key: 0, xs: 12, lg: 4 }, React.createElement(MailSubject, {}, Subject)),
      ]
    );

  }
}

class MailViewRows extends React.PureComponent {
  render(){
    const { top_rows } = this.props;
    return React.createElement(ListGroup, {}, (top_rows || []).map((row, key) => React.createElement(
      ListGroupItem, { key }, React.createElement(MailView, row)
    )));
  }
}

class OfflineMail extends React.PureComponent {
  constructor(props){
    super(props);
    this.setState({
    });
  }

  componentDidMount(){
    const state = {};
    const setState = o => new Promise(set => this.setState(o, set));
    const {
      dbname,
    } = this.props;
    return Promise.resolve(indexedDB.open("mail_provider", commonVersion))
    .then(request => new Promise(opened => {
      request.onsuccess = opened;
      request.onerror   = opened;
      request.onupgradeneeded = initializeMailProvider;
    }))
    .then(event =>{
      const { target } = event || {};
      const { result } = target || {};
      const transaction = result && result.transaction && result.transaction("provider", "readwrite");
      const provider = transaction && transaction.objectStore && transaction.objectStore("provider");
      const request = provider.put({
        name: "gmail",
        priority: -1.0,
      });
      return new Promise(upserted => {
        request.onerror = upserted;
        request.onsuccess = upserted;
      });
    })
    .then(whatever => indexedDB.open("mail_provider"))
    .then(request => new Promise(opened => {
      request.onerror = opened;
      request.onsuccess = opened;
    }))
    .then(event => {
      const { target } = event || {};
      const { result } = target || {};
      const transaction = result && result.transaction && result.transaction("provider", "readonly");
      const provider = transaction && transaction.objectStore && transaction.objectStore("provider");
      const iPriority = provider && provider.index && provider.index("priority");
      return new Promise(gotProviders => {
        const providers = [];
        iPriority.openKeyCursor().onsuccess = e => {
          const cursor = ((e || {}).target || {}).result;
          if(! cursor) return gotProviders(providers);
          const { key } = cursor || {};
          const priority = key && key[0];
          const name = key && key[1];
          providers.push({priority, name});
          if(cursor && cursor.continue) cursor.continue();
        };
      })
    })
    .then(provider_list => {
      const initial_provider = provider_list && provider_list.length && provider_list[0] || "";
      Object.assign(state, {
        provider_list,
        initial_provider,
      });
      const { name } = initial_provider || {};
      return indexedDB.open(name, commonVersion);
    })
    .then(request => new Promise(opened => {
      request.onsuccess = opened;
      request.onerror = opened;
      request.onupgradeneeded = initialize[state.initial_provider];
    }))
    .then(event => {
      const { target } = event || {};
      const { result } = target || {};
      const { objectStoreNames } = result || {};
      const transaction = objectStoreNames && objectStoreNames.contains && objectStoreNames.contains("messages")
        && result && result.transaction && result.transaction("messages", "readonly")
      ;
      const messages = transaction && transaction.objectStore && transaction.objectStore("messages");
      const iPki = messages && messages.index && messages.index("pki");
      const topRows = [];
      return new Promise(gotTopRows => ! iPki ? gotTopRows([]) : iPki.openCursor(
        undefined,
        "prev"
      ).onsuccess = e => {
        const { target } = e || {};
        const { result } = target || {};
        const cursor = result;
        if(! cursor) return gotTopRows(topRows);
        const { value } = cursor;
        const {
          Date,
          From,
          Subject,
          raw_data,
        } = value || {};
        topRows.push({
          Date,
          From,
          Subject,
          raw_data,
        });
        return cursor && cursor.continue && cursor.continue();
      })
      .then(top_rows => {
        Object.assign(state, { top_rows });
        return setState(state);
      })
      .then(set => console.log(this.state))
      ;
    })
    ;
  }

  render(){
    const {
      provider_list,
      top_rows,
    } = this.state || {};
    return React.createElement(Row, {}, [
      React.createElement(Col, { key: 0, xs: 12 }, React.createElement(MailViewForm, { provider_list })),
      React.createElement(Col, { key: 1, xs: 12 }, React.createElement(MailViewRows, { top_rows })),
    ]);
  }
}

export {
  OfflineMail,
}
