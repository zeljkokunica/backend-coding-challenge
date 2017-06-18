package com.engagetech.expenses;

import com.engagetech.expenses.controller.AmountParser;
import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.service.ExchangeRateService;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import java.math.BigDecimal;
import java.util.Date;

@RunWith(MockitoJUnitRunner.class)
public class AmountParserUnitTest {
    @InjectMocks
    private AmountParser amountParser;

    @Mock
    private ExchangeRateService exchangeRateService;

    @Test
    public void testParseNumber() {
        Expense expense = new Expense();
        amountParser.parseAmount(expense, "123.45");
        Assertions.assertThat(expense.getAmount()).isEqualTo(BigDecimal.valueOf(123.45));
        Assertions.assertThat(expense.getAmountCurrency()).isEqualTo(expense.getAmount());
        Assertions.assertThat(expense.getCurrency()).isEqualTo(Currency.GBP);
    }

    @Test
    public void testParseNumberEur() {
        Mockito.when(exchangeRateService.determineExchangeRateToGbp(Mockito.any(Date.class), Mockito.any(Currency.class))).thenReturn(BigDecimal.valueOf(0.5));
        Expense expense = new Expense();
        amountParser.parseAmount(expense, "124.22 EUR");
        Assertions.assertThat(expense.getAmount()).isEqualTo(BigDecimal.valueOf(62.11));
        Assertions.assertThat(expense.getAmountCurrency()).isEqualTo(BigDecimal.valueOf(124.22));
        Assertions.assertThat(expense.getCurrency()).isEqualTo(Currency.EUR);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testParseCurrInvalid() {
        Expense expense = new Expense();
        amountParser.parseAmount(expense, "124.22 XXX");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testParseNumberInvalid() {
        Expense expense = new Expense();
        amountParser.parseAmount(expense, "124.22.32");
    }
}
