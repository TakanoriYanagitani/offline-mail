const {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  ListGroup,
  ListGroupItem,
  Button,
  Modal,
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

const commonVersion = 0x180c;

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
    return React.createElement(Col, { xs: 12 }, React.createElement(
      FormGroup, { controlId: "provider-select" }, [
        React.createElement(ControlLabel, { key: 0 }, "Select Email Provider"),
        React.createElement(FormControl,  { key: 1, componentClass: "select", placeholder: "gmail" }, (provider_list || []).map(
          (provider_info, key) => React.createElement(
            "option", { value: (provider_info || {}).name, key }, (provider_info || {}).name
          )
        )),
      ]
    ));
  }
}

class ImportAfter extends React.PureComponent {
  render(){
    const {
      value,
      onAfterChange,
    } = this.props;
    const onChange = onAfterChange;
    return React.createElement(
      FormGroup, {}, [
        React.createElement(ControlLabel, { key: 0 }, "Mail Date Lower Bound"),
        React.createElement(Datetime,     { key: 1, onChange, closeOnSelect: true, timeFormat: false, value }),
    ]);
  }
}

class ImportBefore extends React.PureComponent {
  render(){
    const {
      value,
      onBeforeChange,
    } = this.props;
    const onChange = onBeforeChange;
    return React.createElement(
      FormGroup, {}, [
        React.createElement(ControlLabel, { key: 0 }, "Mail Date Upper Bound"),
        React.createElement(Datetime,     { key: 1, onChange, closeOnSelect: true, timeFormat: false, value }),
    ]);
  }
}

const gmailInitialize = () => window.gapi && window.gapi.client && window.gapi.client.init && window.gapi.client.init({
  apiKey:   getGmailApiKey(),
  clientId: getGmailClientId(),
  discoveryDocs: [ "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest" ],
  scope: "https://www.googleapis.com/auth/gmail.readonly",
});

class GApiAvailable extends React.PureComponent {
  render(){
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "GApi Available"),
        React.createElement("dd", { key: 1 }, !! window.gapi ? "OK" : "NG"),
      ]
    );
  }
}

class GApiClientAvailable extends React.PureComponent {
  render(){
    const { client_auth2_loaded } = this.props;
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "GApi Client Available"),
        React.createElement("dd", { key: 1 }, !! client_auth2_loaded ? "OK" : "NG"),
      ]
    );
  }
}

const setGmailApi    = key => localStorage.setItem("gmail-api-key", key);
const getGmailApiKey = ()  => localStorage.getItem("gmail-api-key");

const setGmailClientId = key => localStorage.setItem("gmail-client-id", key);
const getGmailClientId = ()  => localStorage.getItem("gmail-client-id");

class GMailApiKeyGet extends React.PureComponent {
  render(){
    const { onSet } = this.props;
    const onClick = e => {
      const got = window.prompt(
        "Paste your GMail Api Key and save to localStorage."
      );
      setGmailApi(got);
      onSet();
    };
    return React.createElement(
      Button, { onClick }, "Set GMail Api Key"
    );
  }
}

class GMailApiKey extends React.PureComponent {
  render(){
    const { onSet, api_set } = this.props;
    const apiKey = getGmailApiKey();
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "GMail API Key"),
        React.createElement("dd", { key: 1 }, !! api_set
          ? "OK"
          : React.createElement(GMailApiKeyGet,   { onSet })
        ),
      ]
    );
  }
}

class GMailClientIdGet extends React.PureComponent {
  render(){
    const { onSet } = this.props;
    const onClick = e => {
      const got = window.prompt(
        "Paste your GMail Client ID and save to localStorage."
      );
      setGmailClientId(got);
      onSet();
    };
    return React.createElement(
      Button, { onClick }, "Set GMail Client ID"
    );
  }
}

class GMailClientId extends React.PureComponent {
  render(){
    const { onSet, client_set } = this.props;
    const clientId = getGmailClientId();
    return React.createElement(
      "dl", {}, [
        React.createElement("dt", { key: 0 }, "GMail Client ID"),
        React.createElement("dd", { key: 1 }, !! client_set
          ? "OK"
          : React.createElement(GMailClientIdGet,   { onSet })
        ),
      ]
    );
  }
}

class ImportReset extends React.PureComponent {
  render(){
    const { onSet, onReset} = this.props;
    const onClick = () => {
      setGmailApi("");
      setGmailClientId("");
      onReset();
      onSet();
    };
    return React.createElement(
      Button, { onClick }, "Reset"
    );
  }
}

class ImportButton extends React.PureComponent {
  render(){
    const {
      is_signed_in,
      updateSigninStatus,
      after,
      before,
    } = this.props;
    const onClick = () => {
      return window.gapi
        && window.gapi.client
        && window.gapi.client.gmail
        && window.gapi.client.gmail.users
        && window.gapi.client.gmail.users.messages
        && window.gapi.client.gmail.users.messages.list
        && window.gapi.client.gmail.users.messages.list({
          userId: "me",
          maxResults: 10,
          q: [
            "before:" + before.format("YYYY/MM/DD"),
            "after:"  +  after.format("YYYY/MM/DD"),
          ].join(" "),
        })
      .then(console.log)
      ;
    };
    const onAuth = () => {
      gmailInitialize()
      .then(initialized =>
        window.gapi &&
        window.gapi.auth2 &&
        window.gapi.auth2.getAuthInstance &&
        window.gapi.auth2.getAuthInstance() &&
        window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus) &&
        window.gapi.auth2.getAuthInstance().signIn()
      )
      .then(updateSigninStatus)
      ;
    };
    return React.createElement(Row, {}, [
      React.createElement(Col, { key: 0, xs: 12, sm: 2 }, React.createElement(Button, { onClick: onAuth  }, "Authorize")),
      React.createElement(Col, { key: 1, xs: 12, sm: 2 }, React.createElement(Button, { onClick }, "Import")),
      React.createElement(Col, { key: 2, xs: 12        }, React.createElement(
        "dl", {}, [
          React.createElement("dt", { key: 0 }, "Is Signed In"),
          React.createElement("dd", { key: 1 }, is_signed_in ? "Yes" : "No"),
        ]
      )),
    ]);
  }
}

const g_isSignedIn = () => window.gapi
  && window.gapi.auth2
  && window.gapi.auth2.getAuthInstance
  && window.gapi.auth2.getAuthInstance()
  && window.gapi.auth2.getAuthInstance().isSignedIn.get()
;

class ImportForm extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      after:  moment().add(-1, "days"),
      before: moment(),
      client_auth2_loaded: window.gapi && window.gapi.client,
      api_set: !! getGmailApiKey(),
      client_set: !! getGmailClientId(),
      is_signed_in: "checking...",
    };
  }

  componentDidMount(){
    const initializeClient = () => {
      this.setState({client_auth2_loaded: window.gapi && window.gapi.client});
      gmailInitialize()
      .then(initialized =>
        window.gapi &&
        window.gapi.auth2 &&
        window.gapi.auth2.getAuthInstance &&
        window.gapi.auth2.getAuthInstance() &&
        window.gapi.auth2.getAuthInstance().isSignedIn.get()
      )
      .then(is_signed_in => this.setState({ is_signed_in }))
      ;
    };
    return window.gapi && window.gapi.load && window.gapi.load(
      "client:auth2",
      initializeClient
    );
  }

  render(){
    const {
      after,
      before,
      client_auth2_loaded,
      api_set,
      client_set,
      is_signed_in,
    } = this.state;
    const onAfterChange  = m => this.setState({ after:  m });
    const onBeforeChange = m => this.setState({ before: m });
    const onReset = () => {
      this.setState({
        after:  moment().add(-1, "days"),
        before: moment(),
        api_set: !! getGmailApiKey(),
        client_set: !! getGmailClientId(),
      });
    };

    const updateSigninStatus = () => this.setState({
      is_signed_in: g_isSignedIn(),
    });

    const onSet = () => {
      this.setState({
        api_set: !! getGmailApiKey(),
        client_set: !! getGmailClientId(),
      });
    };
    return React.createElement(Row, {}, [
      React.createElement(Col, { key: 0, xs: 12        }, React.createElement(ImportButton, { after, before, is_signed_in, updateSigninStatus })),
      React.createElement(Col, { key: 1, xs: 12, lg: 6 }, React.createElement(ImportAfter,  { value: after,  onAfterChange  } )),
      React.createElement(Col, { key: 2, xs: 12, lg: 6 }, React.createElement(ImportBefore, { value: before, onBeforeChange } )),
      React.createElement(Col, { key: 3, xs: 12, lg: 6 }, React.createElement(GApiAvailable)),
      React.createElement(Col, { key: 4, xs: 12, lg: 6 }, React.createElement(GApiClientAvailable, { client_auth2_loaded })),
      React.createElement(Col, { key: 5, xs: 12, lg: 6 }, React.createElement(GMailApiKey,   { onSet, api_set })),
      React.createElement(Col, { key: 6, xs: 12, lg: 6 }, React.createElement(GMailClientId, { onSet, client_set })),
      React.createElement(Col, { key: 7, xs: 12        }, React.createElement(ImportReset, { onSet, onReset })),
    ]);
  }
}

class ImportMail extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      show: false,
    };
  }

  render(){
    const disabled = false;
    const onClick = e => this.setState({ show: true, disabled: true });
    const { show } = this.state;
    const onHide = e => this.setState({ show: false, disabled: false });
    return React.createElement(Col, { xs: 12 }, React.createElement(
      FormGroup, {}, [
        React.createElement(
          Button, {
            key: 0,
            bsStyle: "primary",
            onClick,
            disabled,
          }, "Import"
        ),
        React.createElement(
          Modal,
          {
            key: 1,
            show,
            onHide,
          }, [
            React.createElement(Modal.Header, { key: 0, closeButton: true }, React.createElement(Modal.Title, {}, "Import Mail")),
            React.createElement(Modal.Body,   { key: 1 }, React.createElement(ImportForm)),
          ]
        ),
      ]
    ));
  }
}

class MailViewForm extends React.PureComponent {
  render(){
    const { provider_list } = this.props;
    return React.createElement(
      "form", {}, React.createElement(Row, {}, [
        React.createElement(ProviderSelect, { key: 0, provider_list }),
        React.createElement(ImportMail,     { key: 1 }),
      ])
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
    this.state = {};
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
      request.onupgradeneeded = initialize[state.initial_provider && state.initial_provider.name];
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
