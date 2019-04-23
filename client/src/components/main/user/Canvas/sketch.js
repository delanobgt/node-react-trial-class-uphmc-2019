export default function sketch(p) {
  let rotation = 0;

  p.setup = function() {
    // p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    console.log(window.innerWidth, window.innerHeight);
    // p.createCanvas(500, 400, p.WEBGL);
  };

  p.myCustomRedrawAccordingToNewPropsHandler = function(props) {
    if (props.rotation) {
      rotation = (props.rotation * Math.PI) / 180;
    }
  };

  p.draw = function() {
    p.clear();
    p.background(230, 230, 230, 0);
    p.noStroke();
    p.push();
    p.rotateY(rotation);
    // p.box(100);
    p.pop();
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}
