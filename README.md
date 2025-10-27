# Flappy Bird CloudFone

Classic Flappy Bird game optimized for the CloudFone platform with support for 240x320 (QVGA) and 128x160 (QQVGA) screen resolutions.

## Features

- **Classic Flappy Bird Gameplay**: Navigate the bird through pipes by tapping or pressing keys
- **CloudFone Optimized**: Responsive design for small screens (240x320, 128x160)
- **Multiple Control Methods**: 
  - Keyboard: Spacebar, Enter, or Arrow Up to jump
  - Touch: Tap anywhere on the game canvas
  - Soft Keys: CloudFone-style navigation buttons
- **Offline Support**: Service Worker enables playing without internet
- **Local High Score**: Best score saved in browser storage
- **Responsive UI**: Adapts to different screen sizes and orientations

## CloudFone Platform Compatibility

This game is specifically designed for the CloudFone platform:

- **Screen Sizes**: 240x320 (QVGA) and 128x160 (QQVGA)
- **Input Methods**: Keyboard navigation and soft key bar
- **Performance**: Optimized for limited hardware resources
- **Display**: Adjustable font sizes and UI elements for small screens

## Controls

### Keyboard
- **Spacebar / Enter / Arrow Up**: Make the bird jump
- **Escape**: Return to start screen (during gameplay)

### Touch
- **Tap anywhere**: Make the bird jump

### Soft Keys (CloudFone)
- **Left Soft Key**: Jump/Start/Restart
- **Right Soft Key**: Exit to menu

## Gameplay

1. Press any control to start the game
2. Keep the bird flying by jumping at the right time
3. Avoid hitting pipes or the ground
4. Score points by passing through pipes
5. Try to beat your high score!

## Technical Features

- **HTML5 Canvas**: Smooth 2D graphics rendering
- **Responsive Design**: CSS media queries for different screen sizes
- **Progressive Web App**: Can be installed on supported devices
- **Service Worker**: Offline caching for better performance
- **Local Storage**: Persistent high score tracking

## Installation

### Direct Play
Open `index.html` in any modern web browser.

### Local Development
1. Clone or download the project
2. Serve the files using a local HTTP server:
   ```
   python -m http.server 8000
   ```
   or
   ```
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser

### CloudFone Deployment
1. Upload all files to your CloudFone web server
2. Ensure the manifest.json is properly served
3. Test on CloudFone devices with different screen sizes

## Browser Support

- Modern browsers with HTML5 Canvas support
- Service Worker support (for offline functionality)
- Touch events support (for mobile devices)
- CSS Grid and Flexbox support

## Game Mechanics

- **Gravity**: Constant downward force on the bird
- **Jump Power**: Upward velocity applied when jumping
- **Pipe Generation**: Random height pipes with consistent gaps
- **Collision Detection**: Precise hitbox detection with pipes and ground
- **Scoring**: One point per pipe successfully passed

## Performance

The game is optimized for:
- Low-end devices with limited RAM
- Small screen resolutions
- Touch and keyboard input
- Smooth 60fps gameplay on supported devices

## License

This project is open source and available under the MIT License.

## Credits

- Inspired by the original Flappy Bird game by Dong Nguyen
- Optimized for CloudFone platform specifications
- Built with vanilla HTML5, CSS3, and JavaScript