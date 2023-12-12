/* eslint-disable camelcase */
const router = require('express').Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.NAME,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
});

router.get('/reviews/', async (req, res) => {
  try {
    const id = req.query.product_id;
    const sort = req.query.sort || 'relevant';
    const page = req.query.page || 1;
    const count = req.query.count || 5;
    const offset = (page - 1) * count;
    let sortQuery = null;
    if (sort === 'newest') {
      sortQuery = 'date DESC';
    }
    if (sort === 'helpful') {
      sortQuery = 'helpfulness DESC';
    }
    if (sort === 'relevant') {
      sortQuery = 'date DESC, helpfulness DESC';
    }
    let results = null;
    await pool.query(
      `SELECT
      id AS review_id,
      rating,
      summary,
      recommend,
      response,
      body,
      date,
      reviewer_name,
      helpfulness,
      (
        SELECT COALESCE(json_agg(json_build_object('id', reviews_photos.id, 'url', reviews_photos.url)), '[]')
        FROM reviews_photos
        WHERE reviews.id = reviews_photos.review_id
      ) AS photos
      FROM reviews
      WHERE product_id = $1 AND reported = false
      ORDER BY $2
      LIMIT $3
      OFFSET $4;`,
      [id, sortQuery, count, offset],
    )
      .then((response) => {
        results = response.rows;
      });
    const data = {
      product: id,
      page,
      count,
      results,
    };
    console.log(data);
    res.json(data);
  } catch (error) {
    if (error) {
      console.error(error);
      throw error;
    }
  }
});

router.get('/reviews/meta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let ratings = null;
    await pool.query(`
    SELECT rating, COUNT(*) as count
    FROM reviews
    WHERE product_id = $1
    GROUP BY rating;
  `, [id])
      .then((response) => {
        ratings = response.rows;
      });
    let recommended = null;
    await pool.query(`
    SELECT recommend, COUNT(*) as count
    FROM reviews
    WHERE product_id = $1
    GROUP BY recommend;
  `, [id])
      .then((response) => {
        recommended = response.rows;
      });
    let characteristics = null;
    await pool.query(`
    SELECT name, average_value,characteristic_id
    FROM metachar
    WHERE product_id = $1;
    `, [id])
      .then((response) => {
        characteristics = response.rows;
      });
    ratings = ratings.reduce((obj, item) => {
      obj[item.rating] = parseInt(item.count, 10);
      return obj;
    }, {});
    recommended = recommended.reduce((obj, item) => {
      obj[item.recommend] = parseInt(item.count, 10);
      return obj;
    }, {});
    characteristics = characteristics.reduce((obj, item) => {
      obj[item.name] = { id: item.characteristic_id, value: item.average_value };
      return obj;
    }, {});
    const responses = {
      product_id: id, ratings, recommended, characteristics,
    };
    res.status(200).json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).send('Problems with metadata');
  }
});
router.post('/reviews', async (req, res) => {
  try {
    const
      {
        product_id,
        rating,
        summary,
        body,
        recommend,
        name,
        email,
        photos,
        characteristics,
      } = req.body;
    let review_id = null;
    await pool.query(
      `
  INSERT INTO reviews
  (product_id, rating, summary, body, recommend, reviewer_name , reviewer_email)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id;`,
      [product_id, rating, summary, body, recommend, name, email],
    )
      .then((response) => {
        review_id = response.rows[0].id;
      });
    if (Array.isArray(photos)) {
      photos.map(async (photo) => {
        await pool.query(`
      INSERT INTO reviews_photos
      (review_id, url)
      VALUES($1, $2)
      `, [review_id, photo]);
      });
    } else {
      await pool.query(`
    INSERT INTO reviews_photos
    (review_id, url)
    VALUES($1, $2)
    `, [review_id, photos]);
    }
    const entries = Object.entries(characteristics);
    for (let i = 0; i < entries.length; i += 1) {
      pool.query(`
    INSERT INTO characteristics_reviews
    (characteristic_id, review_id, value)
    VALUES($1, $2, $3)
    RETURNING id;
    `, [entries[i][0], review_id, entries[i][1]]);
    }
    res.send('Completed Post');
  } catch (error) {
    console.error(error);
    res.status(500).send('Problems in Post');
  }
});
router.put('/reviews/:review_id/helpful', (req, res) => {
  const id = parseInt(req.params.review_id, 10);
  pool.query('UPDATE reviews SET helpfulness=helpfulness+1 WHERE id = $1', [id], (error) => {
    if (error) {
      console.log('ran into problems');
      throw error;
    }
    res.status(204).send('Updated!');
  });
});
router.put('/reviews/:review_id/report', (req, res) => {
  const id = req.params.review_id;
  pool.query('UPDATE reviews SET reported=true WHERE id = $1', [id], (error) => {
    if (error) {
      console.log('ran into problems');
      throw error;
    }
    res.status(204).send('Updated!');
  });
});

module.exports = router;
