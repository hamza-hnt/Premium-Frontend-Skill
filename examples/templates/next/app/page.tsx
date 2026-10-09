import Interactive from "./interactive";
export default function Page() {
  return (
    <main>
      <header>
        <a href="#content" className="brand">
          ✳ fieldwork.
        </a>
        <span>Next.js integration fixture</span>
      </header>
      <section id="content">
        <p className="eyebrow">A SMALLER, CALMER WORKSPACE</p>
        <h1>Your best work starts with a little clarity.</h1>
        <p className="intro">
          This page is server rendered. The interactive card below is a client
          boundary with a static first render.
        </p>
        <Interactive />
      </section>
    </main>
  );
}
