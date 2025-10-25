// Switch to the blogDB database
db = db.getSiblingDB('blogDB');

// Create the user with read/write permissions
db.createUser({
  user: 'blogUser',
  pwd: 'Test123',
  roles: [
    {
      role: 'readWrite',
      db: 'blogDB'
    }
  ]
});

console.log('MongoDB user created successfully');