"use client";
export default function VConsoleScript() {
  return (
    <>
      <script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js" />
      <script dangerouslySetInnerHTML={{ __html: "new window.VConsole();" }} />
    </>
  );
}
