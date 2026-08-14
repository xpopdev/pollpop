let hasTailwind = false;
try { require.resolve("tailwindcss"); hasTailwind = true; } catch {}
module.exports = {
  plugins: hasTailwind ? { tailwindcss: {}, autoprefixer: {} } : { autoprefixer: {} },
};
