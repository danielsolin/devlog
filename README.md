# A statically generated blog

This is a blog about software development using [Eleventy](https://www.11ty.dev/) to generate a static website from Markdown files.

## How to use

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm start
    ```

    Your blog should be up and running on [http://localhost:8080](http://localhost:8080). The site will automatically reload when you make changes to the files.

3.  **Build for production:**

    ```bash
    npm run build
    ```

    This will generate a production-ready version of your site in the `_site` directory.

## Project Structure

- `_posts/`: All your blog posts go here as Markdown files.
- `_includes/`: This directory is for Eleventy layouts and other partial templates.
- `.eleventy.js`: The main configuration file for Eleventy.
- `_site/`: The generated output of your site. This directory is not checked into version control.

## Adding new posts

To create a new blog post, simply add a new Markdown file to the `_posts` directory. Eleventy will automatically pick it up and generate a new page for it.

## Deploy your own

You can deploy the contents of the `_site` directory to any static hosting service, such as:

- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
