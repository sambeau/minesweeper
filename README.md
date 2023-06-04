# 💣 Minesweeper

A small minesweeper clone I created as a fun exercise for my portfolio. It does all the usual things a minesweeper does (except '?' tiles, as I don't like those).

Oh, and I went with 10x10 sized board with 12 mines, rather than the usual 8x8/10 or 16x16/40. It's a little easier, so a little more casual for a portfolio.

## About the code

It's written in React and wrapped in Remix. It has one dependency `usehooks-ts` which I didn't use as much as I expected, so I'll probably remove.

The code is reasonably clean and it's well documented. It's in `apps/components/minsweeper` component and all the tricky logic is in the `board` component.

I recursively update the board on a flood fill, which means on large boards the React renderer really struggles to update and it all grinds to a halt for a bit. I could refactor it to update  recursively and then commit the changes in one go, but then you lose the animation. So my 'solution' is to set it to a small board. There's more explanation in the comments.

😎