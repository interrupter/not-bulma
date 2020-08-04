
export default class Common{
	static DEFAULT_REDIRECT_TIMEOUT = 5000;

	static CLASS_OK = 'is-success';
	static CLASS_ERR = 'is-danger';

  static isError(e){
    return e instanceof Error;
  }
};
