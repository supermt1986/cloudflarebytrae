# Cloudflare Blog Application

This is a blog application built with Cloudflare Workers and D1 database.

## Features

- Create, read, update, and delete blog posts
- Instagram-style UI with responsive design
- Serverless architecture using Cloudflare Workers
- Database storage with Cloudflare D1

## Development

To run this application locally:

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

## Deployment

To deploy this application to Cloudflare:

1. Install Wrangler CLI: `npm install -g wrangler`
2. Login to Cloudflare: `wrangler login`
3. Deploy the application: `wrangler deploy`

## Project Structure

- `src/index.ts`: Main application code
- `public/`: Static assets
- `schema.sql`: Database schema
- `wrangler.jsonc`: Wrangler configuration