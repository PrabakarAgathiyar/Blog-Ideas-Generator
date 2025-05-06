
# AI Blog Idea Generator

A free tool to instantly generate SEO-friendly blog post ideas using OpenAI.

## Features
- Generate 10 creative and relevant blog title ideas from any keyword
- SEO-optimized results powered by GPT-3.5
- Client-side rate limit: 5 uses per day (localStorage)
- Server-side rate limit: 5 per IP per day (Netlify function memory)
- Easy to deploy on Netlify

## Setup

1. Add your OpenAI API key in Netlify environment variables as `OPENAI_API_KEY`.
2. Deploy to Netlify or run locally using Netlify CLI.

## Folder Structure

```
netlify/
├── functions/
│   └── generateBlogIdeas.js
index.html
netlify.toml
package.json
```

## Deployment

- Use [Netlify](https://netlify.com) for one-click deploy.
- Make sure the functions folder is set to `netlify/functions`.

## License

Free for personal and commercial use.
