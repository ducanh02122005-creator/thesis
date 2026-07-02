DROP DATABASE IF EXISTS BankDatabase;
CREATE DATABASE IF NOT EXISTS BankDatabase;
USE BankDatabase;



DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
full_name varchar(150) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
password VARCHAR(100) NOT NULL,
role VARCHAR(50) NOT NULL,
created_at DATETIME NOT NULL
);

DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products(
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL ,
    category varchar(100) NOT NULL ,
    price FLOAT NOT NULL ,
    stock BIGINT NOT NULL ,
    merchant Varchar(150),
    created_at DATETIME NOT NULL
);

DROP TABLE IF EXISTS purchases;
CREATE TABLE IF NOT EXISTS purchases(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    total_amount BIGINT NOT NULL ,
    status VARCHAR(50) DEFAULT 'PAID',
    created_at DATETIME NOT NULL ,
    constraint fk_user
                                    foreign key (user_id)
                                    references users(id)
);

DROP TABLE IF EXISTS purchases_items;
CREATE TABLE IF NOT EXISTS purchases_items(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchases_id BIGINT,
    product_id BIGINT,
    quantity int NOT NULL,
    unit_price Double NOT NULL,
    total_price Double Not Null ,
    CONSTRAINT fk_purchases_id
                                          FOREIGN KEY (purchases_id)
                                          References purchases(id),
    CONSTRAINT fk_product_id
        FOREIGN KEY (product_id)
            References products(id)
);
DROP TABLE IF EXISTS transactions;
CREATE TABLE IF NOT EXISTS transactions
(
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_id      BIGINT,
    user_id          BIGINT,
    amount           DOUBLE NOT NULL,
    category         VARCHAR(255),
    hour             INTEGER,
    day_of_week      INTEGER,
    month            INTEGER,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fraud_probability       DOUBLE PRECISION,
    fraud_detected Boolean,
    CONSTRAINT fk_transaction_purchase
        FOREIGN KEY (purchase_id)
            REFERENCES purchases (id),
    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
);


DROP TABLE IF EXISTS fraud_predictions;
CREATE TABLE IF NOT EXISTS fraud_predictions(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id BIGINT,
    fraud_probability DOUBLE PRECISION,
    is_fraud BOOLEAN,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Constraint fk_transaction_id
         FOREIGN KEY (transaction_id)
            REFERENCES  transactions(id)

);

DROP TABLE IF EXISTS alerts;
CREATE TABLE IF NOT EXISTS alerts(
id BIGINT PRIMARY KEY AUTO_INCREMENT,
transaction_id BIGINT,
risk_score DOUBLE PRECISION,
status VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_alert_transaction
FOREIGN KEY(transaction_id)
REFERENCES transactions(id)
);

DROP TABLE IF EXISTS user_risk_profiles;
CREATE TABLE IF NOT EXISTS user_risk_profiles (
    id Bigint PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT ,
    risk_score DOUBLE PRECISION DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    fraud_count INTEGER DEFAULT 0,
    fraud_rate DOUBLE PRECISION DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id
     FOREIGN KEY (user_id)
         REFERENCES users(id) ON DELETE CASCADE
);


-- =====================================
-- INDEXES
-- =====================================

CREATE INDEX idx_transaction_user
    ON transactions(user_id);


CREATE INDEX idx_prediction_fraud
    ON fraud_predictions(is_fraud);

CREATE INDEX idx_alert_status
    ON alerts(status);

CREATE INDEX idx_user_risk_score
    ON user_risk_profiles(risk_score);




