package com.engagetech.expenses.domain;

import java.math.BigDecimal;

public interface ExchangeableAmount {

    BigDecimal getAmount();

    BigDecimal getAmountCurrency();

    BigDecimal getExchangeRate();

    Currency getCurrency();
}
