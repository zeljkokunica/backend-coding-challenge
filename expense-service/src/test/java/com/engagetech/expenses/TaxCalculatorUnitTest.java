package com.engagetech.expenses;

import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.service.TaxCalculatorService;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.runners.MockitoJUnitRunner;

import java.math.BigDecimal;

@RunWith(MockitoJUnitRunner.class)
public class TaxCalculatorUnitTest {
    @InjectMocks
    private TaxCalculatorService taxCalculatorService;

    @Test
    public void testCalculateTax() {
        Expense expense = new Expense();
        expense.setAmount(BigDecimal.valueOf(100));
        taxCalculatorService.calculateTaxAmount(expense, BigDecimal.valueOf(20));
        Assertions.assertThat(expense.getTaxAmount()).isEqualTo(new BigDecimal("20.00"));
        Assertions.assertThat(expense.getTaxRate()).isEqualTo(new BigDecimal("20"));
    }

    @Test
    public void testRounding() {
        Expense expense = new Expense();
        expense.setAmount(BigDecimal.valueOf(33.33));
        taxCalculatorService.calculateTaxAmount(expense, BigDecimal.valueOf(20));
        Assertions.assertThat(expense.getTaxAmount()).isEqualTo(new BigDecimal("6.67"));
    }

}
