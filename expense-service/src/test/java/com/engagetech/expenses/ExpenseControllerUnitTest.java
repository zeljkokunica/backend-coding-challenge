package com.engagetech.expenses;

import com.engagetech.expenses.controller.AmountParser;
import com.engagetech.expenses.controller.ExpensesController;
import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.dto.ExpenseDto;
import com.engagetech.expenses.service.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@RunWith(SpringRunner.class)
@WebMvcTest(ExpensesController.class)
public class ExpenseControllerUnitTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private AmountParser amountParser;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void getUserExpenses() throws Exception {
        Expense expense = new Expense();
        expense.setAmount(BigDecimal.valueOf(123.45));
        expense.setTaxAmount(BigDecimal.valueOf(34.45));
        expense.setReason("Test");
        expense.setDate(new Date());
        List<Expense> allExpenses = Arrays.asList(expense);
        given(expenseService.findByUserId(1L)).willReturn(allExpenses);
        mvc.perform(get("/app/expenses")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].amount", is(expense.getAmount().toString())))
                .andExpect(jsonPath("$[0].vat", is(expense.getTaxAmount().toString())));


    }

    @Test
    public void saveUserExpenses() throws Exception {
        ExpenseDto expenseDto = new ExpenseDto();
        expenseDto.setAmount("123.45");
        expenseDto.setReason("test");
        expenseDto.setDate(LocalDate.of(2017, 6, 17));
        Expense expense = new Expense();
        expense.setDate(Date.from(expenseDto.getDate().atStartOfDay().toInstant(ZoneOffset.UTC)));
        expense.setReason(expenseDto.getReason());
        expense.setAmount(new BigDecimal(expenseDto.getAmount()));
        given(expenseService.save(Mockito.anyLong(), Mockito.any(Expense.class))).willReturn(expense);
        mvc.perform(post("/app/expenses", expenseDto)
                .content(objectMapper.writeValueAsBytes(expenseDto))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("amount", is(expenseDto.getAmount().toString())))
                .andExpect(jsonPath("reason", is(expenseDto.getReason())));
    }
}
