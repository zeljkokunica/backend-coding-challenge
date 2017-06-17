package com.engagetech.expenses.service;

import com.engagetech.expenses.dto.FixerIoExchangeResult;
import feign.Param;
import feign.RequestLine;

/**
 * Connector to fixer.io
 */
public interface FixerIoExchangeConnector {

    @RequestLine("GET /{date}?base={currencyCode}&symbols=GBP")
    FixerIoExchangeResult getRateToGbp(@Param("date") String date, @Param("currencyCode") String currencyCode);
}
