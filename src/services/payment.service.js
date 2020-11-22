module.export = {
  async generatePayUrl(req, res) {
    // const payload = req.body || {

    console.log("BODY", req.body);
    const payload = {
      SiteCode: "TSTSTE0001",
      CountryCode: "ZA",
      CurrencyCode: "ZAR",
      Amount: 10.0,
      // TransactionReference: "12345",
      IsTest: true,
      privateKey: "215114531AFF7134A94C88CEEA48E",
      // BankReference: "12345",
      // NotifyUrl: "https://meal-for.nw.r.appspot.com/notify",
      // NotifyUrl: "http://locahost:5000/notify",
      ...req.body,
    };

    const HashCheck = Object.values(payload).join("").toLowerCase();

    const hash = crypto.createHash("sha512");
    const data = hash.update(HashCheck, "utf-8");
    const ENC = data.digest("hex");

    payload.HashCheck = ENC;

    const params = new URLSearchParams(payload).toString();

    try {
      res.status(200).send(`https://pay.ozow.com/?${params}`);
      // await Axios.post(`https://pay.ozow.com/?${params}`).then((_res) => {
      //   // res.set("Content-Type", "text/html");
      //   // res.end(`${_res.data}`);

      // });
    } catch (err) {
      // res.status(200).send(`https://pay.ozow.com/?${params}`);

      res.status(500).send(err);
    }
  },
};
