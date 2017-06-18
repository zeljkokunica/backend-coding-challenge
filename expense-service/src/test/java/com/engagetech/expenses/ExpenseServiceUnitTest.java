package com.engagetech.expenses;

import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.repository.ExpenseRepository;
import com.engagetech.expenses.service.ExpenseService;
import com.engagetech.expenses.service.TaxCalculatorService;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@RunWith(MockitoJUnitRunner.class)
public class ExpenseServiceUnitTest {

    private static final long DAY = 1000 * 60 * 60 * 24;

    @InjectMocks
    private ExpenseService expenseService;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private TaxCalculatorService taxCalculatorService;

    @Test
    public void testFindUserExpenses() {
        Long userId = 123L;
        List<Expense> testExpenses = Arrays.asList(new Expense());
        Mockito.when(expenseRepository.findByUserIdOrderByDateDesc(userId)).thenReturn(testExpenses);
        List<Expense> result = expenseService.findByUserId(userId);
        Assertions.assertThat(result).isEqualTo(testExpenses);
        Mockito.verify(expenseRepository, Mockito.times(1)).findByUserIdOrderByDateDesc(123L);
    }

    @Test
    public void testSaveExpense() {
        Long userId = 123L;
        Expense expense = new Expense();
        expense.setDate(new Date(System.currentTimeMillis() - 1 * DAY));
        expense.setAmount(BigDecimal.valueOf(100));
        Mockito.when(expenseRepository.save(expense)).thenReturn(expense);
        Expense result = expenseService.save(userId, expense);
        Assertions.assertThat(result).isEqualTo(expense);
        Mockito.verify(taxCalculatorService, Mockito.times(1)).calculateTaxAmount(expense, BigDecimal.valueOf(20));
        Mockito.verify(expenseRepository, Mockito.times(1)).save(expense);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testSaveExpenseFuture() {
        Long userId = 123L;
        Expense expense = new Expense();
        expense.setDate(new Date(System.currentTimeMillis() + 10 * DAY));
        expense.setAmount(BigDecimal.valueOf(100));
        expenseService.save(userId, expense);
    }

}
