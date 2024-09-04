export function bodyParser<T>(req: Request) {
  switch (req.headers.get("Content-Type")) {
    case "multipart/form-data":
    case "application/x-www-form-urlencoded":
      return req
        .formData()
        .then((d) => Object.fromEntries(d.entries())) as Promise<T>;

    case "application/json":
      return req.json() as Promise<T>;

    default:
      throw new Error("unknown or missing Content-Type header");
  }
}
