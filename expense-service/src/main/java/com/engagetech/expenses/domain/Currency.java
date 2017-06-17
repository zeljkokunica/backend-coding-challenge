package com.engagetech.expenses.domain;


public enum Currency {
    GBP(2),
    EUR(2),
    USD(2),
    AUD(2),
    NZD(2),
    HRK(2),
    HUF(0);

    int scale;

    Currency(int scale) {
        this.scale = scale;
    }

    public int getScale() {
        return scale;
    }
}
