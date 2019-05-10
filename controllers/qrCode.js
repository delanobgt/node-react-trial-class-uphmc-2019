const util = require("util");
const fs = require("fs");
const path = require("path");
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const unlink = util.promisify(fs.unlink);
const QRCode = require("qrcode");

exports.generateQrCode = async (req, res) => {
  const { payload } = req.params;
  try {
    const dir = "QR Codes";
    if (!(await exists(dir))) await mkdir(dir);

    const filename = path.join(dir, `${payload}.png`);
    await QRCode.toFile(filename, payload, { rendererOpts: { scale: 5 } });

    const imagePath = path.join(__dirname, "..", dir, `${payload}.png`);
    res.sendFile(imagePath);
    res.on("finish", async () => {
      await unlink(imagePath);
    });
  } catch (error) {
    console.log({ error });
    res.status(500).send("Failed to generate qr code!");
  }
};
