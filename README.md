# E-commerce Demo

This is a sample application that demonstrates an E-commerce API using node js . The application loads 
products a MongoDB database and displays them.

#### Existing Features

- login/register system - allows user access full app functionality ( authentication via jwt token cookies)
- logout
- back to top arrow - scrolling to top of page
- flash messages apperars after user login/registration, add/update/delete and purchase product (disappears after 5s)
- user can't access payment page without registration/login
- after adding product to cart small badge with product quantity appears on menubar beside cart icon
- Stripe payment integration
- short product info cards on homepage
- function preventing access restricted page(checkout) without registration/login

The E-commerce demo can be [viewed online here ](https://eshop-store-q1kv.onrender.com)
Frontend code :  https://github.com/shamna369/Eshop-frontend
Admin can do CRUD operations on products .

##### IDE Development Setup

1. Create a virtual environment for your Node js project.
2. Create a .env file in the root project folder.
3. Add the following variables to the .env file:

  PORT=8000
NODE_ENV=development ,
DATABASE ,
SECRET_KEY ,
TOKEN_EXPIRES ,
SMTP_HOST ,
SMTP_PORT ,
SMTP_USERNAME ,
SMTP_PASSWORD ,
STRIPE_PUBLISHABLE_KEY ,
STRIPE_SECRET_KEY ,
STRIPE_ENDPOINT_SECRET

4. npm install
5. npm start
