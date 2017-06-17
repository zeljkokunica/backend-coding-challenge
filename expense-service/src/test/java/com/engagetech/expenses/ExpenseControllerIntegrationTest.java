package com.engagetech.expenses;

import com.engagetech.ExpenseApplication;
import com.engagetech.expenses.controller.AmountParser;
import com.engagetech.expenses.controller.ExpensesController;
import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.domain.Expense;
import com.engagetech.expenses.dto.ExpenseDto;
import com.engagetech.expenses.repository.ExpenseRepository;
import com.engagetech.expenses.service.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.TestPropertySource;
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
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = ExpenseApplication.class)
@AutoConfigureMockMvc
@TestPropertySource(
        locations = "classpath:application-test.properties")
public class ExpenseControllerIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Test
    public void getUserExpenses() throws Exception {
        createTestExpense();
        mvc.perform(get("/app/expenses")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].amount", is(new BigDecimal("100.00").toString())))
                .andExpect(jsonPath("$[0].vat", is(new BigDecimal("20.00").toString())));
        expenseRepository.deleteAll();
    }

    @Test
    public void saveExpenseGbp() throws Exception {
        ExpenseDto expenseDto = new ExpenseDto();
        expenseDto.setDate(LocalDate.of(2017, 02, 28));
        expenseDto.setReason("February expense");
        expenseDto.setAmount("1000.00");
        mvc.perform(post("/app/expenses")
                .content(objectMapper.writeValueAsBytes(expenseDto))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("amount", is(new BigDecimal("1000.00").toString())))
                .andExpect(jsonPath("reason", is("February expense")))
                .andExpect(jsonPath("vat", is(new BigDecimal("200.00").toString())));
        mvc.perform(get("/app/expenses")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].amount", is(new BigDecimal("1000.00").toString())))
                .andExpect(jsonPath("$[0].vat", is(new BigDecimal("200.00").toString())));
        expenseRepository.deleteAll();
    }

    @Test
    public void saveExpenseEur() throws Exception {
        ExpenseDto expenseDto = new ExpenseDto();
        expenseDto.setDate(LocalDate.of(2017, 02, 28));
        expenseDto.setReason("February expense");
        expenseDto.setAmount("1000.00 EUR");
        mvc.perform(post("/app/expenses")
                .content(objectMapper.writeValueAsBytes(expenseDto))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("amount", is(new BigDecimal("853.05").toString())))
                .andExpect(jsonPath("reason", is("February expense")))
                .andExpect(jsonPath("vat", is(new BigDecimal("170.61").toString())));
        mvc.perform(get("/app/expenses")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].amount", is(new BigDecimal("853.05").toString())))
                .andExpect(jsonPath("$[0].vat", is(new BigDecimal("170.61").toString())));
        expenseRepository.deleteAll();
    }

    private void createTestExpense() {
        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("100.00"));
        expense.setReason("Test reason");
        expense.setDate(new Date());
        expense.setTaxRate(BigDecimal.valueOf(20));
        expense.setTaxAmount(new BigDecimal("20.00"));
        expense.setExchangeRate(BigDecimal.ONE);
        expense.setCurrency(Currency.GBP);
        expense.setAmountCurrency(expense.getAmount());
        expense.setUserId(1L);
        expenseRepository.save(expense);
    }
}
