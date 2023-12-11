
SELECT setval(pg_get_serial_sequence('reviews', 'id'), (SELECT MAX(id) FROM reviews)+1);

SELECT setval(pg_get_serial_sequence('characteristics', 'id'), (SELECT MAX(id) FROM characteristics) + 1);

SELECT setval(pg_get_serial_sequence('characteristics_reviews', 'id'), (SELECT MAX(id) FROM characteristics_reviews) + 1);

SELECT setval(pg_get_serial_sequence('reviews_photos', 'id'), (SELECT MAX(id) FROM reviews_photos) + 1);