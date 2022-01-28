const
  Init = require('not-node').Init,
	path = require('path'),
	manifest = require('./project.manifest.json');

const  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

module.exports = ()=>{

	const options = {
		pathToApp: path.join(__dirname),
		pathToNPM: path.join(__dirname, '../../node_modules'),
		routesPath: path.join(__dirname, './routes'),
		indexRoute: require('./routes/site.js').index
	};

  const additional = {
    db: {
      mongoose: {
        pre: async ({conf}) => {
          console.info('Starting MongoMemoryServer');
          let mongoServer = await MongoMemoryServer.create({ binary: { version: '5.0.4' } });
          conf.uri = mongoServer.getUri();
          console.log('mongo uri',conf.uri);
        }
      }
    },
    async post({config, master}){
      await require('./testEnv')(master.getApp(), config);
    }
  };

  Init.run({options, manifest, additional});
};
