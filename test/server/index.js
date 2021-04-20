//пустой not-node сервер для проверки одного модуля
const log = require('not-log')(module,'test:server');
try {
  const env = 'test';
  process.env.NODE_ENV = env;
  const configModule = require('not-config');
  const confPath = __dirname+'/config';
  //инициализируем доступ к логам

  log.info('Environment', env);
  //иницилизируем доступ к настройкам
  const configLoaded = configModule.init(confPath);
  if (configLoaded === false) {
    log.error('Config not loaded: ', confPath);
  } else {
    log.info('Config loaded: ', confPath);
    require('./app.js')();
  }
} catch (e) {
  log.error(e);
}
