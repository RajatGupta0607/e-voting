import Image from "next/image";
import React from "react";

interface Props {
  height?: number;
  width?: number;
}

export function Logo(props: Props) {
  const { height, width } = props;

  return (
    <Image
      src="/logo.jpg"
      alt="Logo"
      height={height ?? 180}
      width={width ?? 180}
    />
  );
}

export default Logo;
