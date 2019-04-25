import React from "react";

const SvgUntitled2 = ({ id, sectionIndex, size, imgUrl, ...props }) => (
  <svg
    data-name="Layer 1"
    width={size}
    height={size}
    viewBox="0 0 370.41 328.22"
    {...props}
  >
    <defs>
      <radialGradient
        id="gradient_0"
        cx={298}
        cy={421.25}
        r={174.98}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.87} stopColor="#c9c48f" />
        <stop offset={0.94} stopColor="#b5a847" />
        <stop offset={0.98} stopColor="#a9971b" />
      </radialGradient>

      <radialGradient
        id="gradient_1"
        cx={291.08}
        cy={415.47}
        r={219.29}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#f5fbfe" />
        <stop offset={0.42} stopColor="#f3f9fc" />
        <stop offset={0.58} stopColor="#edf3f5" />
        <stop offset={0.68} stopColor="#e3e7ea" />
        <stop offset={0.77} stopColor="#d4d7d9" />
        <stop offset={0.85} stopColor="#c1c2c3" />
        <stop offset={0.91} stopColor="#aaa9a7" />
        <stop offset={0.97} stopColor="#8e8b88" />
        <stop offset={0.98} stopColor="#888481" />
      </radialGradient>

      <radialGradient
        id="gradient_2"
        cx={291.08}
        cy={415.47}
        r={226.15}
        gradientTransform="matrix(1 0 0 2 0 -415.47)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#f4d627" />
        <stop offset={0.07} stopColor="#f7e264" />
        <stop offset={0.14} stopColor="#faec9b" />
        <stop offset={0.21} stopColor="#fcf4c6" />
        <stop offset={0.27} stopColor="#fefae5" />
        <stop offset={0.32} stopColor="#fffef8" />
        <stop offset={0.35} stopColor="#fff" />
        <stop offset={0.61} stopColor="#f7f5dd" />
        <stop offset={0.67} stopColor="#f7f0c1" />
        <stop offset={0.9} stopColor="#f5dd53" />
        <stop offset={1} stopColor="#f4d627" />
      </radialGradient>
    </defs>

    <defs>
      <pattern
        id={"my_img" + id}
        patternUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="100%"
        height="100%"
      >
        <image
          xlinkHref={imgUrl}
          x="50%"
          y="50%"
          height="366"
          width="366"
          transform="translate(-183,-183)"
        />
      </pattern>
    </defs>

    <path
      d="M376.72 257.13H219.28a27.76 27.76 0 0 0-24 13.88l-78.77 136.36a27.74 27.74 0 0 0 0 27.75l78.73 136.36a27.76 27.76 0 0 0 24 13.88h157.48a27.76 27.76 0 0 0 24-13.88l78.73-136.36a27.74 27.74 0 0 0 0-27.75L400.76 271a27.76 27.76 0 0 0-24.04-13.87z"
      transform="translate(-112.79 -257.13)"
      fill={`url(#gradient_${sectionIndex})`}
    />
    <path
      d="M260.56 7.04h-150.7a26.57 26.57 0 0 0-23 13.28L11.5 150.87a26.55 26.55 0 0 0 0 26.57l75.35 130.43a26.58 26.58 0 0 0 23 13.29h150.7a26.58 26.58 0 0 0 23-13.29l75.35-130.51a26.55 26.55 0 0 0 0-26.57L283.57 20.32a26.57 26.57 0 0 0-23.01-13.28z"
      fill={`url(#my_img${id})`}
    />
  </svg>
);

export default SvgUntitled2;
