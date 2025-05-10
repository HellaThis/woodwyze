'use client';

import React from 'react';
import Head from 'next/head';

export default function DemoPage() {
  return (
    <>
      <Head>
        <title>WoodWyze – iPhone Demo</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <style>{`
          :root {
            --device-w: 390px;   /* iPhone‑14‑Pro logical width  */
            --device-h: 844px;   /* iPhone‑14‑Pro logical height */
          }

          html,
          body {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background: #1a1a1a;
            font-family: system-ui, -apple-system, sans-serif;
          }

          .device {
            width: var(--device-w);
            height: var(--device-h);
            border: 16px solid #000;          /* bezel */
            border-radius: 36px;
            background: #000;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .device::before {
            content: "";
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 6px;
            background: #1b1b1b;
            border-radius: 3px;
          }

          .device::after {
            content: "";
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: #1b1b1b;
            border-radius: 2px;
          }

          iframe.screen {
            width: 90%;
            height: 95%;
            border: none;
            border-radius: 30px; /* inner rounding */
            background: #000;
          }
        `}</style>
      </Head>

      <div className="device">
        <iframe
          className="screen"
          src="https://wood-wyze-projects-61e4vo.flutterflow.app/"
          allow="clipboard-write; camera; microphone"
          loading="lazy" width={390} height={844}
        ></iframe>
      </div>
    </>
  );
}