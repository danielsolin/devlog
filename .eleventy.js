const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({ "node_modules/prismjs/themes/": "css/themes/" });

  eleventyConfig.addFilter("dateFormat", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/**/*.md").reverse();
  });

  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("GEMINI.md");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    pathPrefix: "/devlog/",
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
