export default function (options) {
  let {
    blogId,
    themeId,
    customerId
  } = options;
  return {
    shop: {
      method: 'get',
      params: [{
        fields: 'id, name, email, domain, city, address1, zip, phone, country'
      }]
    },
    article: {
      method: 'list',
      params: [blogId]
    },
    asset: {
      method: 'list',
      params: [themeId]
    },
    // checkout: {
    //   method: 'list',
    //   params: []
    // },
    // collect: {
    //   method: 'list',
    //   params: []
    // },
    // comment: {
    //   method: 'list',
    //   params: []
    // },
    // country: {
    //   method: 'list',
    //   params: []
    // },
    // customer: {
    //   method: 'list',
    //   params: []
    // },
    // customerAddress: {
    //   method: 'list',
    //   params: [customerId]
    // },
    // event: {
    //   method: 'list',
    //   params: []
    // },
    // metafield: {
    //   method: 'list',
    //   params: []
    // },
    // order: {
    //   method: 'list',
    //   params: []
    // },
    page: {
      method: 'list',
      params: []
    },
    // policy: {
    //   method: 'list',
    //   params: []
    // },
    product: {
      method: 'list',
      params: []
    },
    theme: {
      method: 'list',
      params: []
    },
    blog: {
      method: 'list',
      params: []
    },
    // user: {
    //   method: 'list',
    //   params: []
    // }
  };
};