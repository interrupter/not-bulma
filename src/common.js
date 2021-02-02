export default class UICommon {
	static DEFAULT_REDIRECT_TIMEOUT = 5000;
	static CLASS_OK = 'is-success';
	static CLASS_ERR = 'is-danger';
	static FILLER = '_';

	/**
	 *	Reformats input from any string to strict phone format
	 *	@param {string}		phone		free style phone number
	 *	@returns {string}					phone number
	 **/
	static formatPhone(val, filler = this.FILLER) {
		//starting from 11 digits in phone number
		const slots = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
		let digits = val.replace(/\D/g, '');
		//if there are more, move them to country code slot
		if (digits.length > 11) {
			let d = digits.length - 11;
			while (d > 0) {
				d--;
				slots.unshift(1);
			}
		}
		let stack = ['', '', '', '', ''];
		Array.from(digits).forEach((digit, index) => {
			let slot = slots[index];
			stack[slot - 1] = (stack[slot - 1] + digit);
		});
		//creating map of parts lengths
		const lens = slots.reduce((acc, curr) => {
			if (typeof acc[curr] === 'undefined') {
				acc[curr] = 1;
			} else {
				acc[curr] += 1;
			}
			return acc;
		}, {});
		//fill empty positions with filler (_)
		for (let t in stack) {
			let dif = lens[t] - stack[t].length;
			while (dif > 0) {
				stack[t] = (stack[t] + filler);
				dif--;
			}
		}
		return `+${stack[0]} (${stack[1]}) ${stack[2]}-${stack[3]}-${stack[4]}`;
	}
}
