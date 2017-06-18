package com.engagetech.expenses;

import com.engagetech.expenses.domain.Currency;
import com.engagetech.expenses.dto.FixerIoExchangeResult;
import com.engagetech.expenses.service.ExchangeRateService;
import com.engagetech.expenses.service.FixerIoExchangeConnector;
import org.assertj.core.api.Assertions;
import org.assertj.core.util.Maps;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Date;

@RunWith(MockitoJUnitRunner.class)
public class ExchangeRateServiceUnitTest {
    public static final BigDecimal TEST_RATE = BigDecimal.valueOf(0.875432);
    @InjectMocks
    private ExchangeRateService exchangeRateService;

    @Mock
    private FixerIoExchangeConnector exchangeConnector;

    @Test
    public void testDetermineRate() {
        FixerIoExchangeResult testResult = new FixerIoExchangeResult();
        testResult.setRates(Maps.newHashMap("GBP", TEST_RATE));
        Mockito.when(exchangeConnector.getRateToGbp("2017-06-17", "EUR")).thenReturn(testResult);
        BigDecimal rate = exchangeRateService.determineExchangeRateToGbp(Date.from(LocalDate.of(2017, 6, 17).atStartOfDay().toInstant(ZoneOffset.UTC)), Currency.EUR);
        Assertions.assertThat(rate).isEqualTo(TEST_RATE);
    }

}
