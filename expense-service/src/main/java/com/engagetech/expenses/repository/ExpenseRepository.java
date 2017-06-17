package com.engagetech.expenses.repository;

import com.engagetech.expenses.domain.Expense;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface ExpenseRepository extends CrudRepository<Expense, String> {
    /**
     * Find all expenses by userId.
     * @param userId user id
     * @return list of the expenses.
     */
    List<Expense> findByUserIdOrderByDateDesc(Long userId);
}
