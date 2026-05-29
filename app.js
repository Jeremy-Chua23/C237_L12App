// Import required modules
const express = require('express');

// Create an Express application
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// In-memory park store
const parkList = [
  {
    name: 'Bukit Timah Nature Reserve',
    location: '177 Hindhede Dr Singapore 589333',
    description: 'A nature reserve with diverse flora and fauna.',
    contacts: 'info@btpark.sg',
    feat1: 'Nature',
    feat2: 'Highest Peak',
    feat3: 'Conservation',
    parkType: 'Nature Reserve'
  },
  {
    name: 'Bishan-Ang Mo Kio Park',
    location: '510 Ang Mo Kio Ave 1 Singapore',
    description: 'A park with many recreational areas.',
    contacts: 'contact@bapark.sg',
    feat1: 'Recreation',
    feat2: 'Walking Trails',
    feat3: 'Fields',
    parkType: 'Urban Park'
  },
  {
    name: 'Rifle Range Nature Park',
    location: 'Rifle Range Rd, Singapore 589322 Singapore',
    description: 'A park that compliments the nature reserves with similar diversity.',
    contacts: 'info@rrnp.sg',
    feat1: 'Nature',
    feat2: 'Diversity',
    feat3: 'Conservation',
    parkType: 'Nature Park'
  }
];

function normalizeParkType(body) {
  if (body.parkType === 'Other') {
    return body.otherParkType && body.otherParkType.trim() ? body.otherParkType.trim() : 'Other';
  }
  return body.parkType || '';
}

// Index page
app.get('/', (req, res) => {
  res.render('index');
});

// Add park routes
app.get('/addPark', (req, res) => {
  res.render('addPark');
});

app.post('/addPark', (req, res) => {
  const { feat1, feat2, feat3 } = req.body;
  const parkType = normalizeParkType(req.body);
  const query = new URLSearchParams({ feat1, feat2, feat3, parkType }).toString();
  res.redirect(`/viewParks?${query}`);
});

// Edit park routes
app.get('/editPark/:index', (req, res) => {
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= parkList.length) {
    return res.redirect('/viewParks');
  }
  res.render('editPark', { park: parkList[index], index });
});

app.post('/editPark/:index', (req, res) => {
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= parkList.length) {
    return res.redirect('/viewParks');
  }

  const { name, location, description, contacts, feat1, feat2, feat3 } = req.body;
  const parkType = normalizeParkType(req.body);

  parkList[index] = { name, location, description, contacts, feat1, feat2, feat3, parkType };
  res.redirect('/viewParks');
});

// Remove park routes
app.get('/removePark/:index', (req, res) => {
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= parkList.length) {
    return res.redirect('/viewParks');
  }
  res.render('removePark', { park: parkList[index], index });
});

app.post('/removePark/:index', (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isNaN(index) && index >= 0 && index < parkList.length) {
    parkList.splice(index, 1);
  }
  res.redirect('/viewParks');
});

// View parks
app.get('/viewParks', (req, res) => {
  const filters = {
    feat1: req.query.feat1 || '',
    feat2: req.query.feat2 || '',
    feat3: req.query.feat3 || '',
    parkType: req.query.parkType || ''
  };

  const parks = parkList.filter((park) => {
    const features = [park.feat1, park.feat2, park.feat3].filter(Boolean);
    const requestedFeatures = [filters.feat1, filters.feat2, filters.feat3].filter(Boolean);
    const hasFeatures = requestedFeatures.every((feature) => features.includes(feature));
    const matchType = !filters.parkType || park.parkType === filters.parkType;
    return hasFeatures && matchType;
  });

  res.render('viewParks', { parks, filters });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});