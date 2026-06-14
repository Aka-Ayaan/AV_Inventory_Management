CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE items (
    item_id            SERIAL PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    category_id        INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    quantity_total     INTEGER NOT NULL DEFAULT 1,
    quantity_available INTEGER NOT NULL DEFAULT 1,
    condition          VARCHAR(50) CHECK (condition IN ('Good', 'Fair', 'Needs Repair')),
    location           VARCHAR(255),
    notes              TEXT,
    requisition_date   DATE
);

CREATE TABLE maintenance_log (
    log_id        SERIAL PRIMARY KEY,
    item_id       INTEGER NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
    reported_by   VARCHAR(100),
    issue         TEXT,
    status        VARCHAR(50) CHECK (status IN ('Reported', 'In Repair', 'Resolved', 'Written Off')),
    report_date   DATE DEFAULT CURRENT_DATE,
    resolved_date DATE
);