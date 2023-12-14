import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 1000 },
    { duration: '30s', target: 1000 },
    { duration: '10s', target: 0 },
  ],
};

const totalProducts = 1000011;
const last10PercentRange = Math.floor(0.1 * totalProducts);
const randomID = Math.floor((Math.random() * last10PercentRange)
 + (totalProducts - last10PercentRange));

export default function () {
  http.get(`http://localhost:3000/reviews/?product_id=${randomID}`);
  http.get(`http://localhost:3000/reviews/meta/?product_id=${randomID}`);
  sleep(1);
}
