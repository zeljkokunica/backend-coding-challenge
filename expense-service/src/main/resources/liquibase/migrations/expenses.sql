--liquibase formatted sql

--changeset zeljko.kunica@gmail.com:expenses_01
CREATE TABLE expenses (
  id integer unsigned not null auto_increment,
  user_id integer unsigned,
  expense_date date not null,
  amount decimal(14,2) not null,
  tax_rate decimal(14,2) not null,
  tax_amount decimal(14,2) not null,
  amount_currency decimal(14,2) not null,
  currency_code varchar(3) not null DEFAULT 'GBP',
  exchange_rate decimal(14,8) not null,
  reason varchar(4000) default null,
  created_at timestamp not null default current_timestamp,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE expenses ADD INDEX `i_expenses_user_id`(`user_id`);
ALTER TABLE expenses ADD INDEX `i_expenses_expense_date`(`expense_date`);


--rollback DROP TABLE expenses;
