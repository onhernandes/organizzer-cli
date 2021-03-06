const api = require('../models/api');
const Adapter = require('axios-mock-adapter');
const mock = new Adapter(api);
const Invoices = require('../models/Invoices');
const creditCardExample = {
  id: 3,
  name: 'Visa Exclusive',
  description: 'Visa Description',
  card_network: 'visa',
  closing_day: 4,
  due_day: 17,
  limit_cents: 1200000,
  kind: 'credit_card',
  archived: true,
  default: false,
  created_at: '2018-06-22T16:45:30-03:00',
  updated_at: '2018-09-01T18:18:48-03:00'
};

const invoiceExample = {
  id: 180,
  date: '2015-01-15',
  starting_date: '2014-12-03',
  closing_date: '2015-01-02',
  amount_cents: 0,
  payment_amount_cents: 0,
  balance_cents: 0,
  previous_balance_cents: 0,
  credit_card_id: 3
};

const transactionExample = {
  id: 19,
  description: 'Gasto no cartão',
  date: '2015-06-03',
  paid: true,
  amount_cents: -5000,
  total_installments: 1,
  installment: 1,
  recurring: false,
  account_id: 3,
  account_type: 'CreditCard',
  category_id: 21,
  contact_id: null,
  notes: '',
  attachments_count: 0,
  created_at: '2015-08-04T20:13:49-03:00',
  updated_at: '2015-08-04T20:14:04-03:00'
};
const fullInvoice = Object.assign(invoiceExample, { transactions: [transactionExample] });

mock.onGet('credit_cards').reply(200, [creditCardExample]);
mock.onGet(`credit_cards/${creditCardExample.id}/invoices`).reply(200, [invoiceExample]);

describe('Invoices test', () => {
  test('Invoices has been listed correctly', () => {
    let result = {
      'start date': '03/12/2014',
      'end date': '02/01/2015',
      amount: 0,
      payment: 0,
      balance: 0
    };
    expect(Invoices.list({ _: ['Visa'] })).resolves.toEqual([result]);
  });

  test('Get invoice details', () => {
    const url = `credit_cards/${creditCardExample.id}/invoices/${invoiceExample.id}`;

    let result = {
      'start date': '03/12/2014',
      'end date': '02/01/2015',
      amount: 0,
      payment: 0,
      balance: 0,
      transactions: [
        {
          description: 'Gasto no cartão',
          date: '03/06/2015',
          paid: 'yes',
          amount: -50,
          'total installments': 1,
          installment: 1,
          recurring: 'no',
          'account type': 'CreditCard',
          notes: '',
          attachments: 0
        }
      ]
    };

    mock.onGet(url).reply(200, fullInvoice);
    expect(Invoices.more({ _: ['Visa'], invoice: '2014-12-03' })).resolves.toEqual(result);
  });

  test('Pay invoice', () => {
    const url = `credit_cards/${creditCardExample.id}/invoices/${invoiceExample.id}`;
    const payUrl = `${url}/payments`;

    let result = {
      'start date': '03/12/2014',
      'end date': '02/01/2015',
      amount: 0,
      payment: 0,
      balance: 0,
      transactions: [
        {
          description: 'Gasto no cartão',
          date: '03/06/2015',
          paid: 'yes',
          amount: -50,
          'total installments': 1,
          installment: 1,
          recurring: 'no',
          'account type': 'CreditCard',
          notes: '',
          attachments: 0
        }
      ]
    };

    mock.onGet(url).reply(200, fullInvoice);
    mock.onGet(payUrl).reply(200, invoiceExample);
    expect(Invoices.pay({ _: ['Visa'], invoice: '2014-12-03' })).resolves.toEqual({ status: 'Invoice paid successfully!' });
  });
});
