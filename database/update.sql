
-- SELECT setval(pg_get_serial_sequence('reviews', 'id'), (SELECT MAX(id) FROM reviews)+1);

-- SELECT setval(pg_get_serial_sequence('characteristics', 'id'), (SELECT MAX(id) FROM characteristics) + 1);

-- SELECT setval(pg_get_serial_sequence('characteristics_reviews', 'id'), (SELECT MAX(id) FROM characteristics_reviews) + 1);

-- SELECT setval(pg_get_serial_sequence('reviews_photos', 'id'), (SELECT MAX(id) FROM reviews_photos) + 1);
-- DROP MATERIALIZED VIEW IF EXISTS metachar;

-- CREATE MATERIALIZED VIEW metachar AS
-- SELECT t1.name, t1.product_id, t2.characteristic_id, AVG(t2.value) AS average_value
-- FROM characteristics t1
-- JOIN characteristics_reviews t2 ON t2.characteristic_id = t1.id
-- GROUP BY t1.product_id, t1.name, t2.characteristic_id;
-- DROP INDEX IF EXISTS metachar_index;
-- CREATE INDEX metachar_index ON metachar(product_id);
-- -- CLUSTER metachar USING metachar_index;

-- DROP INDEX IF EXISTS product_index;
-- CREATE INDEX product_index ON reviews(product_id, id, reported);
-- -- CLUSTER reviews USING product_index;
-- DROP INDEX IF EXISTS photo_index;
-- CREATE INDEX photo_index ON reviews_photos(review_id);

-- ALTER TABLE reviews
-- ADD COLUMN new_date TIMESTAMP NOT NULL DEFAULT NOW();

-- UPDATE reviews
-- SET new_date = TO_TIMESTAMP(date/1000);

ALTER TABLE reviews
DROP COLUMN date;

ALTER TABLE reviews
RENAME COLUMN new_date TO date;