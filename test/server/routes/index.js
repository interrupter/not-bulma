const process = require('process');

module.exports = (app, notApp) => {
  	//можно запросить манифест для клиент-серверного обмена
  	app.get('/api/manifest', function (req, res, next) {
  		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  		res.header('Expires', '-1');
  		res.header('Pragma', 'no-cache');
  		res.json(notApp.getManifest(req));
  	});


    app.get('/terminate', (req, res)=>{
      res.status(200).json({status: 'ok'});
      setTimeout(()=> {process.exit(0)}, 100);
    });

    if (global.__coverage__) {
      app.get('/__coverage__',(req, res)=>{
        res.status(200).json({ coverage: global.__coverage__ });
      });
    }

    app.get('/__session__', (req, res)=>{
      res.status(200).json(req.session);
    });
};
