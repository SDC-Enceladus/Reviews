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
  pool.query('SELECT * FROM reviews WHERE product_id = $1',[id],(error, results)=> {
    if (error) {
      console.log('ran into problems here');
      throw error;
    }
    res.status(200).json(results.rows);
  })
} )


module.exports = router;

