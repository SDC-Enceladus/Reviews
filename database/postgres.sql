
DROP TABLE IF EXISTS "reviews" CASCADE;

CREATE TABLE "reviews" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INT,
  "rating" SMALLINT CHECK (rating > 0 AND rating < 6),
  "date" BIGINT,
  "summary" TEXT,
  "body" TEXT,
  "recommend" BOOLEAN,
  "reported" BOOLEAN DEFAULT false,
  "reviewer_name" TEXT,
  "reviewer_email" TEXT,
  "response" TEXT DEFAULT '',
  "helpfulness" INT DEFAULT 0
);

DROP TABLE IF EXISTS "characteristics" CASCADE;

CREATE TABLE "characteristics" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INT,
  "name" TEXT
);

DROP TABLE IF EXISTS "characteristics_reviews" CASCADE;

CREATE TABLE "characteristics_reviews" (
  "id" SERIAL PRIMARY KEY,
  "characteristic_id" INT,
  FOREIGN KEY(characteristic_id)
    REFERENCES characteristics(id),
  "review_id" INT,
  FOREIGN KEY(review_id)
    REFERENCES reviews(id),
  "value" SMALLINT CHECK (value > 0 AND value < 6)
);

DROP TABLE IF EXISTS "reviews_photos" CASCADE;

CREATE TABLE "reviews_photos" (
  "id" SERIAL PRIMARY KEY,
  "review_id" INT,
 FOREIGN KEY(review_id)
    REFERENCES reviews(id),
  "url" TEXT
);

\COPY reviews FROM '/Users/gordonchiu/Reviews/data/reviews.csv' DELIMITER ',' CSV HEADER;
\COPY reviews FROM '/Users/gordonchiu/Reviews/data/reviews_photos.csv' DELIMITER ',' CSV HEADER;
\COPY reviews FROM '/Users/gordonchiu/Reviews/data/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;
\COPY reviews FROM '/Users/gordonchiu/Reviews/data/characteristics.csv' DELIMITER ',' CSV HEADER;