export default class UICommon {
  static DEFAULT_REDIRECT_TIMEOUT = 5000;
  static CLASS_OK = 'is-success';
  static CLASS_ERR = 'is-danger';

  /**
	*	Reformats input from any string to strict phone format
	*	@param {string}		phone		free style phone number
	*	@returns {string}					phone number
	**/
	static formatPhone(val){
	  //starting from 11 digits in phone number
	  const slots = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
	  let digits = val.replace(/\D/g, '');
	  //if there are more, move them to country code slot
	  if(digits.length > 11){
	    let d = digits.length - 11;
	    while(d > 0){
	      d--;
	      slots.unshift(1);
	    }
	  }
	  let stack = ['', '', '', '', ''];
	  Array.from(digits).forEach((digit, index) => {
	    let slot = slots[index];
	    stack[slot - 1] = (stack[slot - 1] + digit);
	  });
	  return `+${stack[0]} (${stack[1]}) ${stack[2]}-${stack[3]}-${stack[4]}`;
	}
}
