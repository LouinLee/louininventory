// src/utils/formatCurrency.js

import currencyConfig from "../config/currency";

const formatCurrency = (value) => {
    return new Intl.NumberFormat(currencyConfig.locale, {
        style: "currency",
        currency: currencyConfig.currency,
        minimumFractionDigits: 0,
    }).format(value);
};

export default formatCurrency;
