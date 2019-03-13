const choose = settings => {
  const hex      = require('./hexagonal-arrivals-interactor');
  const tools    = require('./system-arrivals-interactor');

  const vanilla = 'http://127.0.0.1:1080/vanilla/arrivals.html';
  
  const chooseUrl = () => {
    return vanilla;
  };
  
  const defaultInteractor = new tools.SystemArrivalsInteractor(
    chooseUrl(),
    settings.browserOptions,
    settings.log,
    settings.features);
  
  return settings.features.hexagonal 
    ? new hex.HexagonalInvoiceInteractor(settings.log, settings.features) 
    : defaultInteractor;
}

module.exports.choose = choose;