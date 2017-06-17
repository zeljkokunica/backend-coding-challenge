package com.engagetech.expenses.service;

import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.dto.FixerIoExchangeResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Service
public class ExchangeRateService {
    private static final DateTimeFormatter EXCHANGE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private FixerIoExchangeConnector fixerIoExchangeConnector;

    public BigDecimal determineExchangeRateToGbp(Date date, Currency currency) {
        FixerIoExchangeResult result = fixerIoExchangeConnector.getRateToGbp(
                EXCHANGE_FORMAT.format(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()), currency.name());
        return result.getRates().get(Currency.GBP.name());
    }
}
