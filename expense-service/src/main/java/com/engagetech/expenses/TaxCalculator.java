package com.engagetech.expenses;

import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.domain.Expense;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TaxCalculator {

    public void calculateTaxAmount(Expense expense, BigDecimal taxRate) {
        BigDecimal taxAmount = expense.getAmount()
                .multiply(taxRate)
                .divide(new BigDecimal("100.00"))
                .setScale(Currency.GBP.getScale(), RoundingMode.HALF_UP);
        expense.setTaxRate(taxRate);
        expense.setTaxAmount(taxAmount);
    }
}
