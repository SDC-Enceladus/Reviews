const router = require('express').Router();
const Pool = require('pg').Pool;
require('dotenv').config();
const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.NAME,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT
})

router.get('/reviews/:id', (req, res) => {
  const id = parseInt(req.params.id);
  pool.query('SELECT * FROM reviews WHERE product_id = $1 AND reported = false',[id],(error, results)=> {
    if (error) {
      console.log('ran into problems here');
      throw error;
    }
    res.status(200).json(results.rows);
  })
} )

router.get('/reviews/meta/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let ratings = null;
  await pool.query(`
  SELECT rating, COUNT(*) as count
  FROM reviews
  WHERE product_id = $1
  GROUP BY rating;
`,[id])
  .then((response)=> {
    ratings = response.rows;
  })
  console.log(ratings);
  let recommended = null;
  await pool.query(`
  SELECT recommend, COUNT(*) as count
  FROM reviews
  WHERE product_id = $1
  GROUP BY recommend;
`,[id])
  .then((response)=> {
    recommended = response.rows;
  })
  console.log(recommended);

res.end();
})
router.post('/reviews',async(req,res) => {
  try{
  const
  {product_id,
  rating,
  summary,
  body,
  recommend,
  name,
  email,
  photos,
  characteristics} = req.body;
  let review_id = null;
  await pool.query(`
  INSERT INTO reviews
  (product_id, rating, summary, body, recommend, reviewer_name , reviewer_email)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id;`,
  [product_id, rating, summary, body, recommend, name, email])
  .then ((response)=> {
    review_id = response.rows[0].id;
  })
  if(Array.isArray(photos)) {
    photos.map(async (photo)=> {
      await pool.query(`
      INSERT INTO reviews_photos
      (review_id, url)
      VALUES($1, $2)
      `, [review_id, photo])
    })
  } else {
    await pool.query(`
    INSERT INTO reviews_photos
    (review_id, url)
    VALUES($1, $2)
    `, [review_id, photos])
  }
  console.log("characteristics is:" ,characteristics);
  for(const entry of Object.entries(characteristics)) {
    console.log(entry);
    await pool.query(`
    INSERT INTO characteristics_reviews
    (characteristic_id, review_id, value)
    VALUES($1, $2, $3)
    RETURNING id;
    `, [entry[0],review_id,entry[1]])
  }
  console.log(review_id);
  res.send("Completed Post");
} catch (error){
  console.error(error);
  res.status(500).send('Problems in Post');
}
})
router.put('/reviews/:review_id/helpful', (req, res) => {
  const id = parseInt(req.params.review_id);
  pool.query('UPDATE reviews SET helpfulness=helpfulness+1 WHERE id = $1',[id],(error, results)=> {
    if (error) {
      console.log('ran into problems');
      throw error;
    }
    res.status(204).send("Updated!");
  })
} )
router.put('/reviews/:review_id/report', (req, res) => {
  const id = parseInt(req.params.review_id);
  pool.query('UPDATE reviews SET reported=true WHERE id = $1',[id],(error, results)=> {
    if (error) {
      console.log('ran into problems');
      throw error;
    }
    res.status(204).send("Updated!");
  })
} )

module.exports = router;

