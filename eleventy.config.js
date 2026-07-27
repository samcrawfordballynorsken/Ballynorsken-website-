const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });

  // Write /preview/* Basic-Auth into _site/_headers from PREVIEW_BASIC_AUTH
  // (format: user:password). Falls back to a local-dev placeholder only.
  eleventyConfig.on("eleventy.after", () => {
    const outDir = path.join(__dirname, "_site");
    const auth = process.env.PREVIEW_BASIC_AUTH || "preview:changeme";
    const lines = [
      "/preview/*",
      `  Basic-Auth: ${auth}`,
      "",
    ];
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "_headers"), lines.join("\n"));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md"],
  };
};
