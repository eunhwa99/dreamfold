"use client";

import { useEffect, useState } from "react";

type Props = {
  alt: string;
  caption: string;
  src: string;
};

export function GeneratedImagePreview({ alt, caption, src }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className="status" data-tone="error">
        저장된 꿈 이미지를 읽지 못했어요. 저장 경로를 확인해 주세요.
      </div>
    );
  }

  return (
    <figure className="dream-image-preview">
      <img src={src} alt={alt} className="dream-image-preview__image" onError={() => setFailed(true)} />
      <figcaption className="dream-image-preview__caption">{caption}</figcaption>
    </figure>
  );
}
