# Game Title

## Description

This is a simple, interactive ball-and-bar game built using HTML, CSS, and JavaScript. In the game, players control a horizontal bar at the bottom of the screen to catch and guide a falling ball into a target hole. The game features dynamically generated holes with a unique target hole, offering a challenging and engaging experience. Demo here: https://coding-mechanism.github.io/stupid-ball-game/

## Features

- **Dynamic Hole Generation**: Holes are randomly generated on the canvas, with one special target hole that players aim to reach.
- **Responsive Bar Control**: Players use keyboard inputs to control the bar's movement, balancing the ball and guiding it to the target.
- **Seed-Based Randomization**: The game uses seed-based randomization for hole generation, ensuring a unique yet consistent layout for each game session.
- **Local Storage for Seed**: The seed for hole generation is stored in local storage, allowing the game layout to persist across browser refreshes.
- **Customizable Difficulty**: Players can click a button to regenerate the hole layout with a new random seed, altering the game's difficulty.

## How to Play

1. **Start the Game**: Load the game in a web browser.
2. **Control the Bar**: Use the keys (`w` and `s`) to control the left side of the bar, and keys (`i` and `j`) to control the right side of the bar.
3. **Guide the Ball**: The objective is to roll the ball across the bar and drop it into the target hole (colored differently).
4. **Avoid Other Holes**: Avoid dropping the ball into any non-target holes.
5. **Change Layout**: Click the "Change Seed" button to randomize the hole layout.
6. **Vary Bar and Ball Speed**: Use the sliders to change the speed of the bar and ball.

## Installation

To play the game locally:

1. Clone the repository: git clone https://github.com/coding-mechanism/stupid-ball-game
2. Open `index.html` in a web browser.

## Contributing

Contributions to the game are welcome! Please feel free to fork the repository and submit pull requests.

## License

[MIT License](LICENSE.txt)
