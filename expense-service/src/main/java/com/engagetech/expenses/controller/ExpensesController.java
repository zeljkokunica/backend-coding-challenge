package com.engagetech.expenses.controller;

import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.dto.ExpenseDto;
import com.engagetech.expenses.service.ExpenseService;
import com.engagetech.security.dto.UserAuthentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * API controller to handle expense related operation.
 */
@RestController
@RequestMapping(value = "/app/expenses", produces = {org.springframework.http.MediaType.APPLICATION_JSON_VALUE})
public class ExpensesController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private AmountParser amountParser;

    @RequestMapping(value = "", method = RequestMethod.GET)
    public List<ExpenseDto> getExpenses() {
        return convertToDtoList(expenseService.findByUserId(getUserId()));
    }

    @RequestMapping(value = "", method = RequestMethod.POST)
    public ExpenseDto postExpense(@RequestBody ExpenseDto expenseDto) {
        Expense expense = new Expense();
        expense.setDate(Date.from(expenseDto.getDate().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        expense.setReason(expenseDto.getReason());
        amountParser.parseAmount(expense, expenseDto.getAmount());
        Expense savedExpense = expenseService.save(getUserId(), expense);
        return convertToDto(savedExpense);
    }

    private ExpenseDto convertToDto(Expense expense) {
        ExpenseDto expenseDto = new ExpenseDto();
        expenseDto.setDate(expense.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        expenseDto.setAmount(expense.getAmount().toString());
        expenseDto.setVat(expense.getTaxAmount());
        expenseDto.setReason(expense.getReason());
        return expenseDto;
    }

    private List<ExpenseDto> convertToDtoList(List<Expense> expenses) {
        return expenses
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private Long getUserId() {
        UserAuthentication userAuthentication = (UserAuthentication) SecurityContextHolder.getContext().getAuthentication();
        return userAuthentication.getUser().getId();
    }

}
