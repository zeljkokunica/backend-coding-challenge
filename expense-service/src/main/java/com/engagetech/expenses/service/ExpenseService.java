package com.engagetech.expenses.service;

import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.repository.ExpenseRepository;
import com.engagetech.expenses.domain.Expense;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    public static final BigDecimal UK_VAT_RATE = BigDecimal.valueOf(20);

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TaxCalculatorService taxCalculatorService;

    public List<Expense> findByUserId(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Expense save(Long userId, Expense expense) {
        expense.setUserId(userId);
        taxCalculatorService.calculateTaxAmount(expense, UK_VAT_RATE);
        expense.getAmount().setScale(Currency.GBP.getScale());
        Expense savedExpense = expenseRepository.save(expense);
        return savedExpense;
    }
}
