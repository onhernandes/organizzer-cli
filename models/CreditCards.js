const api = require('./api');
const moment = require('moment');

const findCreditCard = async (creditCardName) => {
  let {data} = await api.get('/credit_cards');
  let found = false;

  (Array.isArray(data) ? data : [data]).forEach(cat => {
    let match = cat.name.match(new RegExp(creditCardName, 'g'));
    if (match && match[0]) {
      found = cat;
    }
  });

  if (!found) {
    throw new Error('This creditCard was not found!');
  }

  return found;
};

const argscheck = args => {
  if (!args._ || args._.length === 0) {
    throw new Error('You did not provide any credit card title!');
  }

  return true;
};

module.exports = {
  delete: async (args) => {
    argscheck(args);
    const name = args._.shift();
    const found = await findCreditCard(name);
    let {data} = await api.delete(`/credit_cards/${found.id}`);
    return {
      status: 'Credit Card deleted!',
      credit_card: data.name
    };
  },
  edit: async (args) => {
    argscheck(args);
    const name = args._.join(' ');
    const body = {
      name: args.title,
      due_day: parseInt(args.due) || 1,
      closing_day: parseInt(args.closing) || 28,
      update_invoices_since: args['invoices-since'] || moment().format('YYYY-MM-DD')
    };

    const found = await findCreditCard(name);
    let {data} = await api.put(`/credit_cards/${found.id}`, body);
    return {
      status: 'Credit Card updated!',
      credit_card: data.name
    };
  },
  create: async (args) => {
    argscheck(args);
    const body = {
      name: args._.join(' '),
      card_network: args.network || '',
      due_day: parseInt(args.due) || 1,
      closing_day: parseInt(args.closing) || 28,
      limit: (parseInt(args.limit) * 100) || 0
    };

    let {data} = await api.post('/credit_cards', body);

    return {
      status: 'Credit Card created!',
      credit_card: data.name
    };
  },
  list: async () => {
    let {data} = await api.get('/credit_cards');
    return Object.values(data.map(creditCard => creditCard.name));
  },
  more: async (args) => {
    argscheck(args);
    const creditCardName = args._.shift();
    let found = await findCreditCard(creditCardName);
    
    let created_at = moment(found.created_at).format('DD/MM/YYYY').toString();
    let updated_at = moment(found.updated_at).format('DD/MM/YYYY').toString();

    let result = {
      name: found.name,
      description: found.description,
      'card network': found.card_network,
      'closing day': found.closing_day,
      'due day': found.due_day,
      limit: `R$ ${found.limit_cents / 100}`,
      kind: found.kind,
      archived: found.archived ? 'yes' : 'no',
      default: found.default ? 'yes' : 'no',
      'created at': created_at,
      'updated at': updated_at,
    }

    return result;
  }
};

