const app = require('../../../../src/core/application');

class HexagonalArrivalsInteractor {
  constructor(log = null, features = null) {
    this._log         = log;
    this._features    = features;
    this._errors      = [];
    this._application = app.newApplication({ log });
    this._invoice     = { lineItems: [], total: 0 };
    this._application.onEdited(invoice => this._invoice = invoice);
  }

  async create(lineItem) {
    await this._application.edit({ lineItems: [ lineItem ] });
  }

  async save() {
    await this._application.save();
    return true;
  }

  async getTotal() {
    return this._invoice.lineItems[0].total;
  }

  mustNotHaveErrors() {
    const errors = this._errors;
    
    if (errors.length > 0)
      throw new Error(`Expected no errors, got the following <${errors.length}>:\n\n${errors.join('\n')}`);
  }

  async quit() { }
}

module.exports.HexagonalArrivalsInteractor = HexagonalArrivalsInteractor;