export const cors = (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOW_ORIGIN || "*"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-type,authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
  }
};

export const basic = (req) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Basic ")) return false;

  const [user, pass] = Buffer.from(auth.slice(6), "base64")
    .toString()
    .split(":");

  return (
    user === process.env.BASIC_AUTH_USER && pass === process.env.BASIC_AUTH_PASS
  );
};
