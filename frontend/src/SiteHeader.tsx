import { Component } from "react";
import BusIcon from "./BusIcon";
import { IndexPageCopy } from "./constants";

/** Top bar with the logo mark and the product name as a wordmark. */
export default class SiteHeader extends Component {
  /** Render the header bar over the hero. */
  render() {
    return (
      <header className="bg-persian-blue-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <BusIcon className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            {IndexPageCopy.SYSTEM_NAME}
          </span>
        </div>
      </header>
    );
  }
}
