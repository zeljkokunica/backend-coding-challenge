package com.engagetech.expenses;

import com.engagetech.expenses.dto.FixerIoExchangeResult;
import feign.Param;
import feign.RequestLine;

public interface FixerIoExchangeConnector {

//    http://api.fixer.io/2017-05-01?symbols=EUR,GBP
    @RequestLine("GET /{date}?base={currencyCode}&symbols=GBP")
    FixerIoExchangeResult getCompanyInfo(@Param("date") String date, @Param("currencyCode") String currencyCode);


}
