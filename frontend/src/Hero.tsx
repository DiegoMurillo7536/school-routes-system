import { Component } from "react";
import { IndexPageCopy } from "./constants";
import RouteIllustration from "./RouteIllustration";

/** Full-width introduction with the system name, its description and a route drawing. */
export default class Hero extends Component {
  /** Render the hero section on a deep persian-blue gradient. */
  render() {
    return (
      <section className="overflow-hidden bg-linear-to-br from-persian-blue-950 via-persian-blue-800 to-persian-blue-600 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              {IndexPageCopy.SYSTEM_NAME}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-persian-blue-100 sm:text-xl">
              {IndexPageCopy.DESCRIPTION}
            </p>
          </div>
          <RouteIllustration className="mx-auto w-full max-w-md text-persian-blue-200" />
        </div>
      </section>
    );
  }
}
