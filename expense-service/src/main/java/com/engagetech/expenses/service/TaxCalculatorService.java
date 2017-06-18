package com.engagetech.expenses.service;

import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.domain.Expense;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Service for calculating VAT amount for UK.
 */
@Service
public class TaxCalculatorService {

    public void calculateTaxAmount(Expense expense, BigDecimal taxRate) {
        BigDecimal taxAmount = expense.getAmount()
                .multiply(taxRate)
                .divide(new BigDecimal("100.00"))
                .setScale(Currency.GBP.getScale(), RoundingMode.HALF_UP);
        expense.setTaxRate(taxRate);
        expense.setTaxAmount(taxAmount);
    }
}
