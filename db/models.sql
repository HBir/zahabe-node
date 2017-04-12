CREATE TABLE MinnsDu (
	Text	TEXT NOT NULL,
	ID	serial PRIMARY KEY,
	SkrivenAvOld	TEXT,
	SkrivenAv	TEXT,
	MVOrder	decimal UNIQUE
);

CREATE TABLE Stories (
	MVID	int4 PRIMARY KEY,
	Story	TEXT NOT NULL,
	FOREIGN KEY(MVID) REFERENCES MinnsDu (id)
);

CREATE TABLE DailyStat (
	TheDate	int4,
	Amount	int4,
	PRIMARY KEY(TheDate)
);