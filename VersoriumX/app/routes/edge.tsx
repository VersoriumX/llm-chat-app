import type { MetaFunction } from "@vercel/remix";

export const config = { runtime: "edge" };

export const meta: MetaFunction = () => [{ title: "Remix@Edge | VersoriumX" }];

export default function Edge() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to VersoriumX@Edge</h1>
    </div>
  );
}
