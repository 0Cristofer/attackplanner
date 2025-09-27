# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tribal Wars attack planner script written in JavaScript. The project aims to create a browser-based tool to help players plan and coordinate attacks in the browser game Tribal Wars. It will be built using the Tribal Wars Scripts SDK as a foundation.

## Technology Stack

- **Language**: JavaScript (browser-based userscript)
- **Framework**: Tribal Wars Scripts SDK (https://github.com/RedAlertTW/Tribal-Wars-Scripts-SDK)
- **Target Platform**: Tribal Wars browser game
- **SDK Version**: Based on twSDK v1.2.3 (beta)
- **Reference Implementation**: Mass Command Timer (https://twscripts.dev/scripts/massCommandTimer.js)

## Development Setup

### Git Submodule
The Tribal Wars Scripts SDK is included as a git submodule in the `sdk/` directory.

**Initial setup:**
```bash
git clone --recursive <repository-url>
# OR if already cloned:
git submodule update --init --recursive
```

**Updating the SDK:**
```bash
git submodule update --remote sdk
```

### Key Dependencies
1. **sdk/twSDK.js** - Core SDK providing utilities and UI components (included as submodule)
2. **Local Storage** - For caching unit data and user preferences
3. **Tribal Wars Game API** - For fetching world-specific data

### SDK Initialization Pattern
```javascript
twSDK.init({
    scriptData: {
        name: 'Attack Planner',
        version: 'x.x.x',
        author: 'Author Name',
        description: 'Attack planning tool for Tribal Wars'
    },
    translations: { 
        en_DK: { /* English translations */ },
        // Add other language support
    },
    allowedMarkets: [], // Specify allowed game markets
    allowedScreens: ['place', 'map'], // Screens where script can run
    allowedModes: [], // Allowed game modes
    isDebug: false,
    enableCountApi: true
})
```

## Key SDK Features Available

### Data Retrieval Methods
- `twSDK.worldDataAPI` - Fetch world configurations
- Unit and building information retrieval
- Village, player, and alliance data access
- Game feature detection utilities

### Utility Functions
- `twSDK.calculateDistance()` - Distance calculations between coordinates
- `twSDK.formatAsCoord()` - Coordinate formatting
- `twSDK.getParameterByName()` - URL parameter extraction
- Time conversion and manipulation utilities

### UI Components
- `twSDK.renderFixedWidget()` - Create fixed-position UI windows
- Progress bars and loading indicators
- Custom styling injection methods

## Attack Planner Architecture

Based on the reference Mass Command Timer, key components include:

### 1. Core Planning Logic
- **Target Coordinate Management**: Parse and validate attack coordinates
- **Unit Speed Calculations**: Calculate travel times based on unit types
- **Attack Timing**: Coordinate synchronized attack arrivals
- **Unit Type Selection**: Support for different attack types (nuke, noble, support)

### 2. UI Components
```javascript
// Example UI structure
const uiStructure = {
    coordinateInput: 'textarea', // For target coordinates
    unitSpeedSelector: 'select', // Slowest unit configuration
    attackTimeInput: 'datetime-local', // Timing control
    unitsPerTargetInput: 'number', // Attack intensity
    executeButton: 'button' // Launch planning
}
```

### 3. Data Management
- **Local Storage Caching**: Store unit speeds and world data
- **Dynamic Data Fetching**: Retrieve current world unit configurations
- **Configuration Persistence**: Save user preferences

### 4. Common Functions Pattern
```javascript
// Typical function structure
function initializeAttackPlanner() {
    // Setup UI
    // Load cached data
    // Bind event handlers
}

function calculateAttackTiming(coordinates, unitSpeed, arrivalTime) {
    // Distance calculation
    // Travel time computation
    // Launch time determination
}

function generateAttackCommands(planningData) {
    // Create attack URLs
    // Format command outputs
}
```

## Development Guidelines

### Code Structure
- Use IIFE (Immediately Invoked Function Expression) for script encapsulation
- Implement modular functions with clear separation of concerns
- Follow the reference script's patterns for UI generation and data handling

### Performance Considerations
- Cache unit data in localStorage to minimize API calls
- Implement debug logging for development and troubleshooting
- Use asynchronous operations for data fetching

### UI/UX Patterns
- Create responsive interfaces using flexbox layouts
- Pre-fill forms with sensible defaults (current time, etc.)
- Provide clear feedback for user actions and errors

## File Structure

```
/
├── attackPlanner.js          # Main script file
├── src/                      # Source code directory
│   └── massCommandTimer.js # Reference implementation (40KB)
├── sdk/                      # SDK submodule
│   ├── twSDK.js             # Core SDK file
│   ├── README.md            # SDK documentation
│   └── ...                  # Other SDK files
├── .gitignore               # Git ignore rules
├── .gitmodules              # Git submodule configuration
├── CLAUDE.md                # This file
├── README.md                # Installation and usage instructions
└── docs/                     # Additional documentation
    ├── API.md               # API reference
    └── examples.md          # Usage examples
```

## Testing Approach

- Test across different Tribal Wars worlds and configurations
- Verify unit speed calculations with various world settings
- Test coordinate parsing with different input formats
- Validate attack timing calculations for accuracy
- Test UI responsiveness across different screen sizes

## How to Use the Script

### Loading the Script in Tribal Wars

To use any script from this repository in the Tribal Wars game:

1. **Open the Tribal Wars game** in your browser
2. **Open the browser console** (F12 → Console tab)
3. **Run the script loader command**:

```javascript
$.getScript('https://cdn.jsdelivr.net/gh/0Cristofer/attackplanner@main/src/massCommandTimer.js');
```

### Alternative CDN Options

If the primary CDN doesn't work, try these alternatives:

```javascript
// Option B: Statically.io
$.getScript('https://cdn.statically.io/gh/0Cristofer/attackplanner/main/src/massCommandTimer.js');

// Option C: GitHack
$.getScript('https://raw.githack.com/0Cristofer/attackplanner/main/src/massCommandTimer.js');
```

### Why Use CDN?

- **CORB Protection**: GitHub's raw.githubusercontent.com is blocked by Cross-Origin Read Blocking
- **Proper MIME Types**: CDN services serve JavaScript files with correct content types
- **Better Performance**: CDN caching and geographic distribution
- **Reliability**: Designed specifically for serving code files

## Common Development Commands

Since this is a browser userscript:
- **Development**: Edit files directly and reload in browser
- **Testing**: Use browser developer tools and script debug mode
- **Deployment**: Use CDN services (jsDelivr, Statically.io, GitHack) for script distribution