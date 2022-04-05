export default function loadMyVariants() {
  return new Promise((resolv, reject) => {
    setTimeout(() => {
      resolve({
        status: 'ok',
        result: [{
          id: 1,
          title: 'UI'
        }, {
          id: 2,
          title: 'DU'
        }, {
          id: 3,
          title: 'KU'
        }, {
          id: 4,
          title: 'UL'
        }]
      });
    }, 1000);
  });
};