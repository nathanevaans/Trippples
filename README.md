# TRIPPPLES

## ORIGINS

Trippples is a tile based game from the 1970s, invented by William T. Powers. It was originally produced by Benassi
Enterprises, later transferred to Aladdin Industries and granted
a [US patent](http://pat2pdf.org/patents/pat3820791.pdf) in 1974

## ABOUT

The Trippples game consists of a board which holds a total of 64 removable game tiles: 56 directional arrow tiles, two
_start_ (■ and ●) and two _finish_ (□ and ◯) tiles, and four _neutral zone_ (blank)
tiles. These tiles, arranged in one of 8.320987106*10^81 number of ways, make up the game surface

## EVANS HOUSE RULES

- The board is set up as normal
- The move mechanics are the same as normal
- Circle starts in the bottom left corner and square starts in the bottom right corner
- Circle always moves first
- The game is only a draw when a repeated cycle of moves starts for the 3rd time. Who ever forces the cycle and the
  reasons behind this do not matter and no-one can claim a win, it is a draw
- You can only win by reaching your _finish_ tile

## CONTROLS

- Use the range to select the game mode
- If playing an AI choose what piece you want to play as
- Drag your piece to a legal tile when it is your move
- Reset button reshuffles the board

## MODES

### TWO PLAYER

Play a local two player game, take it in turns dragging your piece to legal tiles

### AI PLAYER

#### RANDOM

AI randomly chooses its next move

#### MANHATTAN

AI chooses the move that minimises the manhattan distance between the piece and their _finish_ tile

#### EUCLIDEAN

AI chooses the move the minimises the euclidean distance between the piece and their _finish_ tile

#### MINIMAX

AI can _think_ between 1 and 10 moves ahead, where each board state is evaluated via a utility function that minimises
the current players distance to their _finish_ tile and maximises the opponent's distance to their _finish_ tile

## OFFICIAL RULES

### TILES

- Start (■, ●) tiles
    - They are placed on the same side of the board in opposite corners

- End (□, ◯) tiles
    - They are placed on the same side of the board in opposite corners
    - They are diagonally opposite to their corresponding start tiles

- Neutral tiles
    - placed in the middle of the board

- Directional arrow tiles
    - They are made of a combination of 3 arrows
    - There are 14 arrow arrangements which are all rotated 90 degrees to make up the 56 directional arrow tiles

### SETTING UP THE BOARD

1. Place the _start_, _finish_, and _neutral zone_ tiles
2. Place the directional arrow tiles randomly on the board
3. Place the square and circle markers on their corresponding _start_ tile

### THE PRIMARY RULES

Move your marker in the same direction as one of the three arrows under you _opponent's marker_, while the arrows under
your marker show your opponent which direction _they_ can move.

The object of the game is to move your marker one tile at a time horizontally, vertically or diagonally, either forward
or backward, from the start tile to your finish tile. Whoever reaches his finish tile first wins. Keep in mind that to
get to any particular tile, you must maneuver your opponent onto a tile with an arrow that allows you to reach that
tile.

### GAME RULES

- Playing pieces can be moved to any un-occupied arrow tile, forward, backward or diagonally. They cannot be moved to an
  occupied tile or a neutral-zone tile<sup>*</sup>, and, of course, they cannot be moved off the game surface.
- If a player moves his playing piece to a tile that leaves their opponent without a legal move, the opponent simply
  misses their turn, and the player can then make a second move to any unoccupied arrow tile indicated by the opponent's
  playing piece.
- A player who can make a legal move must do so. They cannot "pass" when a legal move - no matter what the direction or
  result - exists.
- The game is won by the player who reaches their finish tile first. However, there are other ways to win, and "draw"
  games are possible. (see "other ways to win")

<sup>*</sup> Trippples may also be played with the neutral-zone tile as a "wild card," which _can_ be occupied, and
which allows an immediate second move to _any_ tile, regardless of what choices are indicated by the opponent's playing
piece. Either rule is acceptable, as long as the players agree on it in advance

### OTHER WAYS TO WIN

Trippples can be won without a player ever reaching their finish tile. Here's how:

#### The indirect win

When a player can force their opponent into an endless cycle of repeated moves to avoid a tile that will give the player
a move to their finish tile. The player forcing this repetition must have a non-losing move for themselves.

#### The "called freeze"

A player may win by announcing a move tha will freeze both their and their opponent's playing pieces, so that neither
player has a legal move open. The player calling the "freeze," however, must have a non-losing move at the time of the
announcement.

### A GAME IS A DRAW WHEN

- Both playing pieces are frozen (without legal moves possible) and no "called freeze" announcement is made.
- Both playing pieces cycle repeatedly through the same series of moves, each to avoid losing.
- Both playing agree to a draw because the layout of the tiles is such that neither player can win
