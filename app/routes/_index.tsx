// _index.tsx
import type { V2_MetaFunction } from "@remix-run/node";

import { Minesweeper, links as MinesweeperLinks } from "~/components/minesweeper/minesweeper";

import styles from "~/css/index.css";
export const links = () => [
  ...MinesweeperLinks(),
  { rel: "stylesheet", href: styles },
];

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Minesweeper" },
    { name: "description", content: "Welcome to Minesweeper!" },
  ];
};

export default function Index() {
  return (
    <main className="blue-wave">
      <Minesweeper />
    </main>
  );
}
