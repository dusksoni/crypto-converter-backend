// Install necessary packages:
// npm install express axios

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors())

app.get('/api/currency-list', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/supported_vs_currencies');
    const currencies = response.data;

    res.json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint to fetch the top 100 cryptocurrencies and supported currencies
app.get('/api/currencies', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'inr',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    });

    const currencies = response.data.map((crypto) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      image: crypto.image,
      price: crypto.current_price
    }));

    res.json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint for currency conversion
app.get('/api/convert', async (req, res) => {
  const { sourceCurrency, amount, targetCurrency } = req.query;

  if (!sourceCurrency || !amount || !targetCurrency) {
    return res.status(400).json({ error: 'Invalid request. Please provide sourceCurrency, amount, and targetCurrency.' });
  }

  try {
    // Fetch real-time exchange rates
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: sourceCurrency,
        vs_currencies: targetCurrency,
      },
    });

    const exchangeRate = response.data[sourceCurrency][targetCurrency];
    const convertedAmount = amount * exchangeRate;

    res.json({ sourceCurrency, amount, targetCurrency, convertedAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
