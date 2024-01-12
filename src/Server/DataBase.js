// Import SQL module 
const sql = require('mssql');

// Connection configuration
const config = {
  user: 'Fyrazhka',
  password: '12344321',
  server: 'localhost', 
  port:1433,
  database: 'Questionnaires',

  // Add port if connecting to named instance
  // server: 'localhost\\instance,1433'

  // Optional settings
  options: {
    encrypt: false,
    trustServerCertificate: true // Enable encryption
  }
}

// Helper to print errors
function printError(err) {
  if (err) {
    console.log(err.message);
  }
}

// Connect to SQL Server
sql.connect(config)
  .then(pool => {
    // Successfull connection
    return pool.request()
      .query('SELECT 1'); 
  })
  .then(result => {
    // Query successful
    console.log(result);
    sql.close();
  })
  .catch(err => {
    // Error in connection or query
    printError(err); 
  });

// Alternative using callbacks
sql.connect(config, err => {

  // Handle connection errors
  if (err) {
    printError(err);
    return; 
  }  

  // Create request
  let request = new sql.Request();

  // Query database
  request.query('SELECT 1', (err, result) => {
    
    // Handle query errors
    if (err) printError(err);

    // Print result
    console.log(result);

    // Close connection pool
    sql.close();
  });

});