Project Management - SitInfra

A complete web management application developed with React, TypeScript, Vite, Prisma, and Netlify Functions.

📋 Prerequisites

Before starting, make sure you have installed the following tools on your machine:

Node.js (version 18 or higher) – Download Node.js

npm or yarn (usually included with Node.js)

MySQL (version 8.0 or higher) – Download MySQL

You must have a running MySQL server

You must have created an empty MySQL database

Git (to clone the project) – Download Git

Checking prerequisites

You can check if Node.js and npm are installed by running the following commands in your terminal:

node --version
npm --version

🚀 Installation and Setup
1. Clone the project (if needed)
git clone <repo-url>
cd netlify_v1

2. Install dependencies
npm install


This command installs all necessary dependencies listed in package.json, including:

React and React DOM

TypeScript

Vite

Prisma Client

Netlify Functions

And other dependencies...

3. Database configuration
Create a .env file

Create a .env file at the root of the project (same level as package.json).

Configure the DATABASE_URL variable

The DATABASE_URL variable is used by Prisma to connect to your MySQL database. It follows a specific format:

DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

Explanation of the URL components:

mysql:// — Connection protocol (always mysql:// for MySQL)

USER — MySQL username with access rights to the database

Example: root, admin, my_user

PASSWORD — MySQL user password

⚠️ Important: If your password contains special characters (like @, #, :, /), you must URL-encode them.
For example: @ becomes %40, # becomes %23.

HOST — MySQL server address

For local databases: localhost or 127.0.0.1

For remote databases: the IP address or domain name (e.g., db.example.com)

PORT — The port MySQL is listening on (default is 3306)

DATABASE — The name of the database you created

Examples of DATABASE_URL:

Example 1 – Local database with root user:

DATABASE_URL="mysql://root:myPassword123@localhost:3306/sitinfra_db"


Example 2 – Local database with special characters in password:
If your password is P@ssw0rd#123, you must encode the special characters:

DATABASE_URL="mysql://root:P%40ssw0rd%23123@localhost:3306/sitinfra_db"


Example 3 – Remote database:

DATABASE_URL="mysql://admin:securepass@192.168.1.100:3306/production_db"


Example 4 – Hosted database (e.g., PlanetScale, Railway, etc.):

DATABASE_URL="mysql://user:password@hostname.provider.com:3306/database_name"

URL Encoding Reference Table
Character	URL Encoding
@	%40
#	%23
:	%3A
/	%2F
%	%25
&	%26
+	%2B
(space)	%20
Example of a complete .env file

Create a .env file at the project root with the following content (adapt it to your configuration):

# MySQL Database Configuration
DATABASE_URL="mysql://root:your_password@localhost:3306/your_database_name"

4. Initialize the database with Prisma
Generate the Prisma Client

After setting up your database, generate the Prisma client:

npx prisma generate


This command generates the Prisma client based on your schema (prisma/schema.prisma).

Synchronize the database with Prisma models

After configuring the database and generating the Prisma client, apply your Prisma schema to the database:

npx prisma db push

🏃 Run the project
Development mode

To run the project in development mode with automatic reloading:

netlify dev

📚 Additional Documentation

Prisma Documentation

Vite Documentation

React Documentation

Netlify Functions

🏗️ Project Structure

/src — React application source code

/netlify/functions — Netlify serverless functions (backend API)

/prisma — Prisma schema and migrations

/public — Static files (images, etc.)

netlify.toml — Netlify configuration

package.json — npm dependencies and scripts