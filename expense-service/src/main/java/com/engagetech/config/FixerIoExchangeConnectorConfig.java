package com.engagetech.config;

import com.engagetech.expenses.service.FixerIoExchangeConnector;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Feign;
import feign.Logger;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for fixer.io open feign service implementation.
 */
@Configuration
public class FixerIoExchangeConnectorConfig {

    @Bean
    public FixerIoExchangeConnector fixerIoExchangeConnector() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        JacksonDecoder decoder = new JacksonDecoder(objectMapper);
        return Feign
                .builder()
                .encoder(new JacksonEncoder(objectMapper))
                .decoder(decoder)
                .logLevel(Logger.Level.BASIC)
                .target(FixerIoExchangeConnector.class, "http://api.fixer.io/");
    }
}
