import { Component } from "react";

/** The props of RouteIllustration: extra classes that place and size it. */
interface RouteIllustrationProps {
  className?: string;
}

/** Decorative drawing of a bus route: a dashed path that links a few stops. */
export default class RouteIllustration extends Component<RouteIllustrationProps> {
  /** The x and y position of each stop along the route, from start to end. */
  private static readonly STOPS: readonly (readonly [number, number])[] = [
    [40, 220],
    [150, 120],
    [260, 170],
    [360, 60],
  ];

  /** Render the route as an inline SVG hidden from assistive technology. */
  render() {
    const [lastX, lastY] =
      RouteIllustration.STOPS[RouteIllustration.STOPS.length - 1];
    return (
      <svg
        viewBox="0 0 400 280"
        fill="none"
        aria-hidden="true"
        className={this.props.className}
      >
        <path
          d="M40 220 C 80 140, 110 110, 150 120 S 220 190, 260 170 S 330 70, 360 60"
          stroke="currentColor"
          strokeOpacity={0.55}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="2 14"
        />
        {RouteIllustration.STOPS.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle
              cx={x}
              cy={y}
              r={16}
              fill="currentColor"
              fillOpacity={0.15}
            />
            <circle cx={x} cy={y} r={7} fill="white" />
          </g>
        ))}
        <circle cx={lastX} cy={lastY} r={7} className="fill-amber-300" />
      </svg>
    );
  }
}
