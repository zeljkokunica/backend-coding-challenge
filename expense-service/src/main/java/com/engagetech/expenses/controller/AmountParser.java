package com.engagetech.expenses.controller;

import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.service.ExchangeRateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.regex.Pattern;

@Component
public class AmountParser {
    private static final String NUMERIC_REGEX = "[0-9]+(\\.[0-9][0-9]?)?";

    @Autowired
    private ExchangeRateService exchangeRateService;

    public void parseAmount(Expense expense, String amountValue) {
        if (Pattern.matches(NUMERIC_REGEX, amountValue)) {
            expense.setAmount(new BigDecimal(amountValue));
            expense.setExchangeRate(BigDecimal.ONE);
            expense.setAmountCurrency(expense.getAmount());
            expense.setCurrency(Currency.GBP);
        } else {
            parseCurrency(expense, amountValue);
        }
    }

    private void parseCurrency(Expense expense, String amountValue) {
        String currencyCode = amountValue.replaceAll(NUMERIC_REGEX, "").trim();
        String amountText = amountValue.replaceAll(currencyCode, "").trim();
        Currency currency;
        try {
            currency = Currency.valueOf(currencyCode.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported currency " + currencyCode, e);
        }
        try {
            expense.setAmountCurrency(new BigDecimal(amountText));
        } catch (NumberFormatException nfe) {
            throw new NumberFormatException("Invalid amount " + amountText);
        }
        expense.setCurrency(currency);
        expense.setExchangeRate(exchangeRateService.determineExchangeRateToGbp(expense.getDate(), currency));
        expense.setAmount(expense.getAmountCurrency().multiply(expense.getExchangeRate()).setScale(Currency.GBP.getScale(), BigDecimal.ROUND_HALF_UP));
    }

}
