package com.engagetech.expenses;

import com.engagetech.expenses.domain.Expense;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TaxCalculator taxCalculator;

    public List<Expense> findByUserId(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    public Expense save(Long userId, Expense expense) {
        expense.setUserId(userId);
        taxCalculator.calculateTaxAmount(expense, BigDecimal.valueOf(20));
        Expense savedExpense = expenseRepository.save(expense);
        return savedExpense;
    }
}
