const
  ENV = 'test',
  express = require('express'),
  expressSession = require('express-session'),
  methodOverride = require('method-override'),
  serveStatic = require('serve-static'),
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer,
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  notNode = require('not-node'),
  notAppConstructor = notNode.notApp,
  notErrorReporter = require('not-error').notErrorReporter,
  log = require('not-log')(module),
  notWSServer = require('not-ws').notWSServer,
  notWSRouter = require('not-ws').notWSRouter,
  notWSMessenger = require('not-ws').notWSMessenger,
  jwt = require('jsonwebtoken'),
  config = require('not-config').reader;

var expressApp,
  notApp,
  WSServer,
  WSClient;

let initServerEnv = function() {
  log.info('Setting up server environment variables...');
  let fullServerName = ((config.get('proxy:secure') == 'true') ? 'https' : 'http') + '://' + config.get('host') + ':' + (config.get('proxy:port') || config.get('port'));
  config.set('staticPath', path.join(__dirname, config.get('path:static') || 'static'));
  config.set('modulesPath', path.join(__dirname, config.get('path:modules') || 'modules'));
  config.set('appPath', __dirname);
  config.set('npmPath', path.join(__dirname, '../../node_modules'));
  config.set('fullServerName', fullServerName);
};

let initServerApp = function() {
  log.info('Setting up express app...');
  expressApp = express();
  expressApp.use(helmet());

  require('@cypress/code-coverage/middleware/express')(expressApp);

  notApp = new notAppConstructor({
    mongoose: mongoose
  });
  notApp.reporter = notErrorReporter;
  notApp.setEnv('appPath', __dirname);
  if (Array.isArray(config.get('importModulesFromNPM'))) {
    config.get('importModulesFromNPM').forEach((modName) => {
      notApp.importModuleFrom(path.join(config.get('npmPath'), modName), modName);
    });
  }
  notApp.ENV = ENV;
  expressApp.use(bodyParser.json({
    limit: '150mb'
  })); // for parsing application/json
  expressApp.use(bodyParser.urlencoded({
    limit: '150mb',
    extended: true
  })); // for parsing application/x-www-form-urlencode
  expressApp.use(methodOverride());
  expressApp.use((req, res, next)=>{
    if(ENV === 'test' && req.query.test){
      if (!req.session){
        req.session = {};
      }
      if(req.query.session){
        req.session.id = req.query.session;
      }
      if(req.query.role){
        req.session.user = {};
        req.session.role = req.query.role;
      }
    }
    console.log(req.session);
    next();
  });
};

let initMongoose = function(input) {
  mongoServer = new MongoMemoryServer();
  log.info('Starting MongoMemoryServer');
  return mongoServer
    .getConnectionString()
    .then((mongoUri) => {
      log.info('Setting up mongoose connection... ' + mongoUri);
      mongoose.Promise = global.Promise;
      return mongoose.connect(mongoUri);
    })
    .then(()=>{
      log.info('Mongoose connected...');
      notNode.Increment.init(mongoose);
    })
    .catch(log.error);
};

let initTemplateEngine = function(input = {
  views: 'views',
  engine: 'pug'
}) {
  log.info('Setting up template (' + input.engine + ') engine...');
  expressApp.set('views', path.join(__dirname, input.views));
  expressApp.set('view engine', input.engine);
};

let initUserSessions = function() {
  log.info('Setting up user sessions handler...');
  var MongoStore = require('connect-mongo')(expressSession);
  expressApp.use(expressSession({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  }));

};

let initCORS = function() {
  log.info('Setting up CORS rules to * ...');
  var corsOptions = {
    origin: '*',
    credentials: false
  };
  expressApp.use(cors(corsOptions));
};

let startup = function() {
  log.info('Setting up HTTP server...');
  expressApp.set('protocol', 'http');
  http.createServer(expressApp).listen(config.get('port'), function() {
    log.info('Server listening on port ' + config.get('port'));
  });
};

let initMiddleware = function(input) {
  log.info('Setting up middlewares...');
  log.info(input)
  if (input) {
    for (let ware in input) {
      if (ware) {
        let warePath = input[ware].path || ware,
          proc;
        if (require(warePath).getMiddleware) {
          proc = require(warePath).getMiddleware(input[ware]);
        } else if (require(warePath).middleware) {
          proc = require(warePath).middleware;
        } else {
          proc = require(warePath);
        }
        expressApp.use(proc);
      }
    }
  }
};


let serveFrontJS = function(req, res, next) {
  let rolesPriority = config.get('user:roles:priority') || ['root', 'admin', 'client', 'user', 'guest'],
    frontAppRoot = config.get('path:front'),
    frontApp = path.join(frontAppRoot, 'guest.js');
  if (req.user) {
    for (let role of rolesPriority) {
      if (req.user.role.indexOf(role) > -1) {
        frontApp = path.join(frontAppRoot, role + '.js');
        break;
      }
    }
  }
  return serveStatic(path.join(__dirname, frontApp))(req, res, next);
};

let serveFrontCSS = function(req, res, next) {
  let rolesPriority = config.get('user:roles:priority') || ['root', 'admin', 'client', 'user', 'guest'],
    frontAppRoot = config.get('path:front'),
    frontApp = path.join(frontAppRoot, 'guest.css');
  if (req.user) {
    for (let role of rolesPriority) {
      if (req.user.role.indexOf(role) > -1) {
        frontApp = path.join(frontAppRoot, role + '.css');
        break;
      }
    }
  }
  return serveStatic(path.join(__dirname, frontApp))(req, res, next);
};

let serveFrontHTML = function(req, res, next) {
  let rolesPriority = config.get('user:roles:priority') || ['root', 'admin', 'client', 'user', 'guest'],
    frontAppRoot = config.get('path:front'),
    frontApp = path.join(frontAppRoot, 'guest.html');
  if (req.user) {
    for (let role of rolesPriority) {
      if (req.user.role.indexOf(role) > -1) {
        frontApp = path.join(frontAppRoot, role + '.html');
        break;
      }
    }
  }
  return serveStatic(path.join(__dirname, frontApp))(req, res, next);
};

let serveFront = function() {
  //доступ к админке
  expressApp.use('/front/(:role).js', serveFrontJS);
  expressApp.use('/front/(:role).html', serveFrontHTML);
  expressApp.use('/front/(:role).css', serveFrontCSS);
};

let initExposeRoutes = function() {
  log.info('Setting up routes...');
  notApp.expose(expressApp);
  const routes = require('./routes');
  routes(expressApp, notApp);
  expressApp.use(serveStatic(config.get('staticPath')));

  //доступ к админке
  serveFront();
  expressApp.use((req, res) => {
    require('./routes/site.js').index(req, res);
  });
};

let initModules = function() {
  notApp.execInModules('initialize');
};

const TRANSIT_RESPONSE_REQUEST = [];

let initWSServer = function() {
  log.info('Starting WSServer...');
  try {
    WSServer = new notWSServer({
      port: config.get('modules:ws:port'),
      events:{
        onmessage:  (msg)=>{
          notApp.log('incoming message ', msg.service.type, msg.service.name);
        }
      },
      getRouter() {
        return new notWSRouter({}, {
          request: require('./routes/ws.js')
        });
      },
      getMessenger() {
        return new notWSMessenger({
          secure: config.get('modules:ws:secure'),
          types: {
            'request': [
              ...TRANSIT_RESPONSE_REQUEST
            ],
            'response': [
              ...TRANSIT_RESPONSE_REQUEST
            ]
          },
          validators: {
            credentials(credentials) {
              try {
                let data = jwt.verify(credentials, config.get('modules:user:secret'));
                if (data && typeof data.active === 'boolean') {
                  return data.active;
                } else {
                  return false;
                }
              } catch (e) {
                console.error(e);
                return false;
              }
            }
          }
        })
      },
      secure: config.get('modules:ws:secure'),
      jwt: {
        key: config.get('modules:user:secret')
      }
    });
    notApp.setEnv('WSServer', WSServer);
    WSServer.start();
    log.info('WS server listening on port ' + config.get('modules:ws:port'));
  } catch (e) {
    log.error('WS server startup failure');
    log.error(e);
  }
}

module.exports = async () => {
  log.info('Kick start app...');
  initServerEnv();
  //initFileStore(config.get('store'));
  await initMongoose(config.get('mongoose'));
  initServerApp();
  initUserSessions();
  initTemplateEngine(config.get('template'));
  initCORS(config.get('cors'));
  initMiddleware(config.get('middleware'));
  initExposeRoutes();
  initModules();
  //startup server
  startup();
  initWSServer();
//initializing test environment
  await require('./testEnv')(notApp, config);
};
