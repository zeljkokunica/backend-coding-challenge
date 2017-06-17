package com.engagetech.expenses.domain;

import java.math.BigDecimal;

public interface TaxableAmount {
    BigDecimal getAmount();

    Currency getCurrency();
}
