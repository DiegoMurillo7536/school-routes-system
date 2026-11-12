import { Component } from "react";

/** The props of BusIcon: extra classes that size and color the icon. */
interface BusIconProps {
  className?: string;
}

/** Decorative school bus logo mark, drawn with the current text color. */
export default class BusIcon extends Component<BusIconProps> {
  /** Render the bus as an inline SVG hidden from assistive technology. */
  render() {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={this.props.className}
      >
        <rect x="4" y="3" width="16" height="14" rx="3" />
        <path d="M4 10h16" />
        <path d="M12 3v7" />
        <circle cx="8" cy="13.5" r="1" />
        <circle cx="16" cy="13.5" r="1" />
        <path d="M7 17v3" />
        <path d="M17 17v3" />
      </svg>
    );
  }
}
