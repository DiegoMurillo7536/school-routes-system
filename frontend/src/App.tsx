import { Component } from "react";
import Hero from "./Hero";
import PhasesSection from "./PhasesSection";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** Index page: a landing page that introduces the system and lists its phases. */
export default class App extends Component {
  /** Render the header, the hero, the phases section and the footer. */
  render() {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <PhasesSection />
        </main>
        <SiteFooter />
      </div>
    );
  }
}
