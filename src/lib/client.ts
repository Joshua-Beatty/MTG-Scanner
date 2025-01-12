import axios from 'axios';
import rateLimit from 'axios-rate-limit';


const client = rateLimit(axios.create({baseURL: "https://api.scryfall.com"}), { maxRPS: 9 })

export default client