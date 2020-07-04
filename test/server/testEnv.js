function shutDown(){
	process.exit(0);
}

module.exports = async (notApp, config)=>{
  try{
		process.on('SIGTERM', shutDown);
		process.on('SIGINT', shutDown);
		return;
  }catch(e){
    notApp.report(e);
  }
}
