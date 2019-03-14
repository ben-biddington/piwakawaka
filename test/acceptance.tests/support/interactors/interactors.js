const choose = settings => {
  const hex                               = require('./hexagonal-arrivals-interactor');
  const tools                             = require('./system-arrivals-interactor');
  const { newConsoleArrivalsInteractor }  = require('./system-arrivals-interactor');
  
  if (settings.viewAdapter == 'cli') {
    settings.log(`Selecting adapter <${settings.viewAdapter}>`);
    return newConsoleArrivalsInteractor();
  }

  return settings.features.hexagonal 
    ? new hex.HexagonalInvoiceInteractor(settings.log, settings.features) 
    : new tools.SystemArrivalsInteractor('http://127.0.0.1:1080/vanilla/arrivals.html', settings);
}

module.exports.choose = choose;