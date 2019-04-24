import React from "react";

const SvgUntitled2 = ({ id, size, imgUrl, ...props }) => (
  <svg
    data-name="Layer 1"
    width={size}
    height={size}
    viewBox="0 0 370.41 328.22"
    {...props}
  >
    <defs>
      <radialGradient
        id="Untitled-2_svg__a"
        cx={298}
        cy={421.25}
        r={174.98}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.87} stopColor="#c9c48f" />
        <stop offset={0.94} stopColor="#b5a847" />
        <stop offset={0.98} stopColor="#a9971b" />
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
        {/* <image xlinkHref={imgUrl} x="0" y="0" width={362} height={362} /> */}
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
      fill="url(#Untitled-2_svg__a)"
    />
    <path
      d="M260.56 7.04h-150.7a26.57 26.57 0 0 0-23 13.28L11.5 150.87a26.55 26.55 0 0 0 0 26.57l75.35 130.43a26.58 26.58 0 0 0 23 13.29h150.7a26.58 26.58 0 0 0 23-13.29l75.35-130.51a26.55 26.55 0 0 0 0-26.57L283.57 20.32a26.57 26.57 0 0 0-23.01-13.28z"
      fill={`url(#my_img${id})`}
    />
  </svg>
);

export default SvgUntitled2;
