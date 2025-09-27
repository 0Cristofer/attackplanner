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

## Attack Planner Design & Implementation

### **Design Goals**
The attack planner simplifies attack planning and execution by allowing players to:
1. Choose targets, arrival time, and unit configurations
2. Assign villages to attack/support each target
3. Execute attacks via ordered command list with direct rally point links

### **Complete Feature Requirements**

#### **Step 1: Initial Configuration**
- **Attack Group**: Dropdown with all available village groups
- **Support Group**: Dropdown with all available village groups  
- **Attack Unit 1 & 2**: Dropdowns with all world units (for timing calculations)
- **Support Unit 1 & 2**: Dropdowns with all world units (for timing calculations)
- **Target Coordinates**: Textarea input (like Mass Command Timer)
- **Arrival Time**: Absolute datetime input

#### **Step 2: Target Assignment (Loop)**
- Display target analysis: each coordinate + count of reachable villages
- Player selects target → show reachable villages for that target
- Player assigns villages and chooses attack type (real attack/fake attack)
- **Village Exclusion Logic**:
  - Fake assignments don't exclude villages from other targets
  - Real assignments exclude villages from future real targets
  - Villages already assigned as real cannot be selected for real attacks again

#### **Step 3: Command Execution**
- Display final command list ordered by send time
- Show contextual info (travel time, distance, send time remaining)
- Visually distinguish fake attacks from real attacks
- Direct links to rally point with correct village and target pre-filled
- **Unit Selection at Execution**: If village has both selected units available, show two buttons to choose which unit to use

### **Technical Architecture**

#### **Data Structures**
```javascript
// Plan state structure
const planState = {
    step: 1, // Current step (1, 2, or 3)
    config: {
        attackGroup: groupId,
        supportGroup: groupId,
        attackUnit1: 'ram',
        attackUnit2: 'catapult', 
        supportUnit1: 'heavy',
        supportUnit2: 'archer',
        coordinates: ['500|500', '501|501'],
        arrivalTime: Date
    },
    assignments: [
        {
            target: '500|500',
            villages: [
                { villageId: 123, type: 'real', unit: 'ram' },
                { villageId: 456, type: 'fake', unit: 'spear' }
            ]
        }
    ],
    excludedVillages: [123] // Villages already assigned to real attacks
}
```

#### **Core Functions**
```javascript
// Step 1: Configuration
function buildConfigurationUI()
function fetchVillageGroups()
function fetchWorldUnits()
function validateConfiguration()
function saveProgress()

// Step 2: Target Assignment  
function buildTargetAnalysisUI()
function calculateReachableVillages(target, arrivalTime, units)
function assignVillageToTarget(villageId, target, type, unit)
function updateExcludedVillages()

// Step 3: Command Execution
function buildCommandListUI()
function generateCommandList()
function calculateSendTimes()
function createRallyPointURL(villageId, target, units)

// Navigation & Persistence
function goToPreviousStep()
function resetPlan()
function loadSavedPlan()
function autoSavePlan()
```

### **Implementation Progress**

#### ✅ **Completed**
- [x] **Basic Script Structure**: SDK integration, translations, popup framework
- [x] **Repository Setup**: Git structure, documentation, CDN deployment
- [x] **Basic UI**: Simple popup with coordinate input and validation

#### 🚧 **In Progress** 
- [ ] **Step 1 Implementation**: Group selection and unit configuration UI

#### 📋 **Todo**
- [ ] **Data Fetching**: Village groups and world units API integration
- [ ] **Step 2 Implementation**: Target analysis and village assignment logic  
- [ ] **Step 3 Implementation**: Command list generation and execution
- [ ] **Persistence System**: Auto-save, load, and navigation between steps
- [ ] **Village Exclusion Logic**: Real vs fake attack assignment rules
- [ ] **Rally Point Integration**: Direct links with pre-filled data
- [ ] **Time Calculations**: Multi-unit timing with user selection options
- [ ] **Testing & Refinement**: Cross-world compatibility and edge cases

### **Current Development Status**
- **Active Branch**: `develop`
- **Current Step**: Implementing Step 1 UI with group and unit selection
- **Last Update**: Basic popup with coordinate input created and tested
- **Next Milestone**: Complete Step 1 configuration form with dropdowns

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