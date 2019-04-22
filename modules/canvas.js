const { createCanvas, loadImage } = require("canvas");

module.exports.generateCaptchaImagePngStream = captcha => {
  const CHAR_W = 40;
  const W = captcha.value.length * CHAR_W;
  const H = 75;

  const canvas = createCanvas(W + 20, H + 10);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#CFB539";
  ctx.fillRect(0, 0, W + 20, H + 10);
  ctx.translate(10, 5);

  ctx.fillStyle = "#1b1a17";
  for (let i = 0; i < captcha.value.length; i++) {
    const ch = captcha.value.charAt(i);
    ctx.save();
    const fontSizePixel = Math.floor(Math.random() * 10 + 25);
    ctx.font = `${fontSizePixel}px Arial`;
    const chMeasure = ctx.measureText(ch);
    ctx.translate(
      CHAR_W * i + (CHAR_W - chMeasure.width) / 2,
      (H - fontSizePixel) / 2
    );
    ctx.rotate(
      (Math.PI / 3.5) * Math.random() * (Math.random() > 0.5 ? 1 : -1)
    );
    ctx.fillText(ch, 0, (H - fontSizePixel) / 2.5);
    ctx.restore();
  }
  return canvas.createPNGStream();
};
