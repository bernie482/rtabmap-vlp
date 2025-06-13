export const fruValuesParser = (values) => {
  let FRU_DATA = {};
  let CHASSIS = {};
  let PRODUCT = {};
  let BOARD = {};
  let DEVICE = {};
  let CHS_EX = {};
  let PROD_EX = {};
  let BO_EX = {};

  values.forEach((d, idx) => {
    FRU_DATA[d.Name] = d;
    DEVICE[idx] = d.Name;
    CHASSIS[d.Name] = d.Chassis;
    PRODUCT[d.Name] = d.Product;
    BOARD[d.Name] = d.Board ?? {};
    BOARD[d.Name]['FRUDeviceID'] = d.FRUDeviceID;
    BOARD[d.Name]['Language'] = d.Language;
    CHS_EX[d.Name] = d.Chassis?.Extra ?? null;
    PROD_EX[d.Name] = d.Product?.Extra ?? null;
    BO_EX[d.Name] = d.Board?.Extra ?? null;
    if (CHASSIS[d.Name]?.Extra) {
      delete CHASSIS[d.Name].Extra;
    }
    if (PRODUCT[d.Name]?.Extra) {
      delete PRODUCT[d.Name].Extra;
    }
    if (BOARD[d.Name]?.Extra) {
      delete BOARD[d.Name].Extra;
    }
  });
  return {
    FRU_DATA,
    DEVICE,
    CHASSIS,
    PRODUCT,
    BOARD,
    CHS_EX,
    PROD_EX,
    BO_EX,
  };
};
